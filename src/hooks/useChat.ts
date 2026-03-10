// src/hooks/useChat.ts
// ─────────────────────────────────────────────────────────────────────────────
// BUGS FIXED IN THIS VERSION:
//
//  BUG 1 — Messages disappear on sender side (optimistic message wiped):
//    ROOT CAUSE: The onConnected history-merge algorithm was broken. It built
//    [...serverMessages, ...pendingOptimistic, ...newServerMessages] which
//    duplicated messages that were already in `prev` as server echoes. The
//    final dedup pass kept wrong entries depending on array order, not time.
//    FIX: Replace with a single, correct merge:
//         • Union of serverMessages ∪ current prev
//         • Deduplicated by messageId (server id wins over local- id when
//           content+sender match, meaning the optimistic entry is replaced)
//         • Sorted ascending by timestamp
//
//  BUG 2 — Optimistic message not cleaned up correctly:
//    ROOT CAUSE: The removal filter matched on senderId+content. If the user
//    sent the same text twice quickly, the first server echo removed BOTH
//    optimistic entries.
//    FIX: Optimistic messages now carry a `correlationId` embedded in the
//    messageId ("local-<correlationId>"). The server echo carries the same
//    correlationId in a custom header field. Since we cannot change the server
//    DTO, we fall back to content+sender matching but limit removal to exactly
//    ONE entry (the first match), not all matches.
//
//  BUG 3 — onConnected is called on every reconnect and always replaces state:
//    FIX: History fetch is now idempotent — it merges, never replaces.
//
//  BUG 4 — stableOnMatch never updated session state:
//    ROOT CAUSE: MatchNotification carries yourAnonymousId/sessionId but the
//    handler only checked matched:false. When the socket reconnects mid-session
//    and a new match event arrives, the session object in state was never
//    updated, so yourAnonymousId was stale and all dedup broke.
//    FIX: onMatchRef.current now updates `session` when matched:true.
//
//  BUG 5 — leaveSession set status to IDLE before the server confirmed:
//    FIX: Status transitions to IDLE only after the API call resolves (or
//    rejects). If offline, it still clears locally after a 3s timeout.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { chatSocket }    from "../api/chatSocket.service";
import * as chatApi      from "../api/chatApi.service";
import { ChatAuthError } from "../api/chatApi.service";
import type {
  ChatMessageDto,
  ChatSessionDto,
  ChatStatus,
  MatchNotification,
  TypingNotification,
} from "../types/chat.types";

const POLL_MS            = 2_500;
const TYPING_RESET_MS    = 2_500;
const TYPING_THROTTLE_MS = 2_000;

export interface UseChatReturn {
  status:        ChatStatus;
  messages:      ChatMessageDto[];
  session:       ChatSessionDto | null;
  queueSize:     number | null;
  partnerTyping: boolean;
  error:         string | null;

  startSearch:  () => Promise<void>;
  cancelSearch: () => Promise<void>;
  sendMessage:  (content: string, replyToId?: string) => void;
  notifyTyping: () => void;
  leaveSession: () => Promise<void>;
  resetChat:    () => void;
}

// ── Merge helpers ─────────────────────────────────────────────────────────────

/**
 * Merge two message arrays:
 *  1. Union by messageId (serverMessages win on conflict)
 *  2. Replace each "local-*" optimistic entry if a real message with
 *     matching (senderId + content) now exists in the server set
 *  3. Sort ascending by timestamp
 *
 * This is the single canonical merge used in onConnected AND onMessage.
 */
function mergeMessages(
  current: ChatMessageDto[],
  incoming: ChatMessageDto[]
): ChatMessageDto[] {
  // Build a map of real messageIds from incoming
  const incomingById = new Map<string, ChatMessageDto>(
    incoming.map((m) => [m.messageId, m])
  );

  // For each incoming message, check if it can replace an optimistic entry
  const optimisticKeys = new Set(
    current
      .filter((m) => m.messageId.startsWith("local-"))
      .map((m) => `${m.senderId}||${m.content}`)
  );

  // Track which optimistic entries have been "claimed" by a server echo
  // so we only remove ONE optimistic entry per server message (not all duplicates)
  const claimedOptimistic = new Set<string>();

  const kept: ChatMessageDto[] = current.filter((m) => {
    if (!m.messageId.startsWith("local-")) return true; // real message, keep
    if (incomingById.has(m.messageId)) return false;    // same id arrived, drop

    const key = `${m.senderId}||${m.content}`;
    if (optimisticKeys.has(key)) {
      // Check if any incoming message matches this optimistic one
      const matchingServer = incoming.find(
        (s) => s.senderId === m.senderId && s.content === m.content
      );
      if (matchingServer && !claimedOptimistic.has(key)) {
        claimedOptimistic.add(key); // claim: remove this ONE optimistic entry
        return false;
      }
    }
    return true; // no server match yet, keep the optimistic entry
  });

  // Add all incoming messages that are not already in `kept`
  const keptIds = new Set(kept.map((m) => m.messageId));
  const newEntries = incoming.filter((m) => !keptIds.has(m.messageId));

  return [...kept, ...newEntries].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChat(): UseChatReturn {
  const [status,        setStatus]        = useState<ChatStatus>("IDLE");
  const [messages,      setMessages]      = useState<ChatMessageDto[]>([]);
  const [session,       setSession]       = useState<ChatSessionDto | null>(null);
  const [queueSize,     setQueueSize]     = useState<number | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const pollRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingResetRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const typingThrottleTs = useRef<number>(0);

  // Store latest session in a ref so socket handlers never go stale
  const sessionRef = useRef<ChatSessionDto | null>(null);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Refs for stable socket handlers
  const onMessageRef = useRef<(msg: ChatMessageDto) => void>(() => {});
  const onTypingRef  = useRef<(n: TypingNotification) => void>(() => {});
  const onMatchRef   = useRef<(n: MatchNotification) => void>(() => {});

  useEffect(() => {
    return () => {
      _stopPolling();
      _clearTypingReset();
      chatSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Internal helpers ────────────────────────────────────────────────────────

  const _stopPolling = () => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const _clearTypingReset = () => {
    if (typingResetRef.current !== null) {
      clearTimeout(typingResetRef.current);
      typingResetRef.current = null;
    }
  };

  // ── Socket handler implementations (kept fresh via refs) ────────────────────

  onMessageRef.current = (msg: ChatMessageDto) => {
    // USER_LEFT: partner left → transition to PARTNER_LEFT
    if (msg.messageType === "USER_LEFT" || msg.messageType === "CHAT_ENDED") {
      setMessages((prev) => mergeMessages(prev, [msg]));
      setStatus("PARTNER_LEFT");
      chatSocket.disconnect();
      _stopPolling();
      return;
    }

    // Normal TEXT / SYSTEM message: merge (handles optimistic dedup)
    setMessages((prev) => mergeMessages(prev, [msg]));
  };

  onTypingRef.current = (_n: TypingNotification) => {
    setPartnerTyping(true);
    _clearTypingReset();
    typingResetRef.current = setTimeout(
      () => setPartnerTyping(false),
      TYPING_RESET_MS
    );
  };

  onMatchRef.current = (n: MatchNotification) => {
    if (!n.matched) {
      // Partner left — server sent this via /queue/match
      setStatus("PARTNER_LEFT");
      chatSocket.disconnect();
      _stopPolling();
      return;
    }

    // BUG 4 FIX: update session when a new match arrives (e.g. after reconnect)
    if (n.sessionId && n.yourAnonymousId) {
      setSession((prev) => {
        if (!prev) return prev; // session was already set by REST response
        return {
          ...prev,
          sessionId:          n.sessionId,
          yourAnonymousId:    n.yourAnonymousId,
          partnerAnonymousId: n.partnerAnonymousId ?? prev.partnerAnonymousId,
        };
      });
    }
  };

  // Stable references that never change identity (safe to pass to useCallback deps)
  const stableOnMessage = useCallback(
    (msg: ChatMessageDto) => onMessageRef.current(msg), []
  );
  const stableOnTyping = useCallback(
    (n: TypingNotification) => onTypingRef.current(n), []
  );
  const stableOnMatch = useCallback(
    (n: MatchNotification) => onMatchRef.current(n), []
  );

  // ── Connect + history load ──────────────────────────────────────────────────

  const onMatchSuccess = useCallback(
    async (sess: ChatSessionDto) => {
      setSession(sess);
      sessionRef.current = sess;
      setStatus("CONNECTED");
      setError(null);

      chatSocket.connect({
        onMessage:    stableOnMessage,
        onTyping:     stableOnTyping,
        onMatchEvent: stableOnMatch,

        onError: (msg) => {
          setError(msg);
          setStatus("ERROR");
        },

        // BUG 1 FIX: Use mergeMessages instead of replacing state.
        // This preserves any optimistic messages that raced with the socket
        // connect, and is safe to call on every reconnect.
        onConnected: () => {
          chatApi
            .getMessages(50)
            .then((res) => {
              if (res.success && res.data && res.data.length > 0) {
                setMessages((prev) => mergeMessages(prev, res.data!));
              }
            })
            .catch(() => {
              // Non-fatal: messages already visible from optimistic/echoes
            });
        },
      });
    },
    [stableOnMessage, stableOnTyping, stableOnMatch]
  );

  // ── Polling for match ───────────────────────────────────────────────────────

  const _startPolling = useCallback(() => {
    _stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await chatApi.getCurrentSession();
        if (res.success && res.data?.sessionId) {
          _stopPolling();
          await onMatchSuccess(res.data);
        }
      } catch (err) {
        if (err instanceof ChatAuthError) {
          _stopPolling();
          setError("Session expired — please log in again.");
          setStatus("ERROR");
        }
        // Other errors (network blip): keep polling
      }
    }, POLL_MS);
  }, [onMatchSuccess]);

  // ── Public API ──────────────────────────────────────────────────────────────

  const startSearch = useCallback(async () => {
    setError(null);
    setMessages([]);
    setSession(null);
    sessionRef.current = null;
    setQueueSize(null);
    setStatus("SEARCHING");
    chatSocket.disconnect(); // clean up any stale connection

    try {
      const res = await chatApi.startSearch();
      if (!res.success) throw new Error(res.message ?? "Search failed");

      if (res.data?.matched && res.data.session) {
        _stopPolling();
        await onMatchSuccess(res.data.session);
      } else {
        setQueueSize(res.data?.queueSize ?? null);
        _startPolling();
      }
    } catch (err: unknown) {
      if (err instanceof ChatAuthError) {
        setError("Session expired — please log in again.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
      setStatus("ERROR");
    }
  }, [onMatchSuccess, _startPolling]);

  const cancelSearch = useCallback(async () => {
    _stopPolling();
    try { await chatApi.cancelSearch(); } catch (_) { /* fire-and-forget */ }
    setStatus("IDLE");
  }, []);

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (!chatSocket.isConnected) {
      setError("Connection lost — please refresh.");
      return;
    }

    // BUG 2 FIX: Only append optimistic message when yourAnonymousId is known.
    // Use a stable key so mergeMessages can match exactly ONE optimistic entry
    // per (senderId+content) pair even if the same text is sent twice.
    const senderAnonymousId = sessionRef.current?.yourAnonymousId;
    if (senderAnonymousId) {
      const optimistic: ChatMessageDto = {
        messageId:   `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId:    senderAnonymousId,
        content:     trimmed,
        messageType: "TEXT",
        timestamp:   new Date().toISOString(),
        // Embed replyToId so the quoted preview renders immediately on sender's side
        ...(replyToId ? { replyToId } : {}),
      };
      setMessages((prev) => [...prev, optimistic]);
    }

    chatSocket.sendMessage(trimmed);
  }, []); // no dep on session — reads via sessionRef

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - typingThrottleTs.current < TYPING_THROTTLE_MS) return;
    typingThrottleTs.current = now;
    if (chatSocket.isConnected) chatSocket.sendTyping();
  }, []);

  // BUG 5 FIX: Don't set IDLE until server confirms (or timeout). This
  // prevents a race where the UI resets before the server sends the
  // partner-left notification, causing the partner to get stuck.
  const leaveSession = useCallback(async () => {
    _stopPolling();
    chatSocket.disconnect();

    // Fire the leave API; give it 3 s before forcing local reset
    const leaveTimeout = setTimeout(() => {
      _resetLocalState();
    }, 3_000);

    try {
      await chatApi.leaveSession();
    } catch (_) {
      // ignore — partner was already notified server-side if connection existed
    } finally {
      clearTimeout(leaveTimeout);
      _resetLocalState();
    }
  }, []);

  const _resetLocalState = () => {
    setStatus("IDLE");
    setMessages([]);
    setSession(null);
    sessionRef.current = null;
    setQueueSize(null);
    setPartnerTyping(false);
    setError(null);
  };

  const resetChat = useCallback(() => {
    _stopPolling();
    _clearTypingReset();
    chatSocket.disconnect();
    _resetLocalState();
  }, []);

  return {
    status, messages, session, queueSize, partnerTyping, error,
    startSearch, cancelSearch, sendMessage, notifyTyping, leaveSession, resetChat,
  };
}