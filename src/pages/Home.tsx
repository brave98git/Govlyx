import { useState, useEffect, useCallback, useRef } from "react";
import { Flame, Clock, ArrowUp, MapPin, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "../components/post/PostCard";
import type { AnyPost, SocialPost, GovernmentPost } from "../components/post/PostCard";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

interface PaginatedResponse<T> {
  content: T[];
  hasMore: boolean;
  nextCursor: number | null;
  size: number;
}

interface SocialPostDto {
  id: number;
  content: string;
  timeAgo?: string;
  username: string;
  userDisplayName?: string;
  userProfileImage?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByCurrentUser?: boolean;
  isSaved?: boolean;
  hashtags?: string[];
  isGovernmentBroadcast?: boolean;
  department?: string;
  broadcastScope?: "AREA" | "DISTRICT" | "STATE" | "COUNTRY";
  broadcastScopeDescription?: string;
}

type FeedTab = "all" | "location" | "following" | "hot" | "new" | "top" | "for-you";

function getAuthToken(): string | null {
  return localStorage.getItem("token") || "demo-token-123";
}

function toPostCardPost(dto: SocialPostDto): AnyPost {
  if (dto.isGovernmentBroadcast) {
    return {
      ...dto,
      variant: "government",
      department: dto.department ?? dto.userDisplayName ?? dto.username,
      isGovernmentBroadcast: true,
    } as GovernmentPost;
  }
  return { ...dto, variant: "social" } as SocialPost;
}

const FEED_SIZE = 20;

const PostSkeleton = () => (
  <div className="rounded-xl border border-base-300 bg-base-200 p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="h-3 w-4/6" />
    <div className="flex gap-3 pt-1">
      <Skeleton className="h-7 w-14" />
      <Skeleton className="h-7 w-14" />
      <Skeleton className="h-7 w-14" />
    </div>
  </div>
);

function useFeed(tab: FeedTab) {
  const [posts, setPosts] = useState<AnyPost[]>([
    {
      id: 1,
      variant: "social",
      content: "Excited to see Govlyx coming together! Looking forward to modernizing our community interactions. #Govlyx #Community",
      username: "Sambh",
      userDisplayName: "Sambh Sharma",
      timeAgo: "2h ago",
      likeCount: 42,
      commentCount: 5,
      shareCount: 12,
      isLikedByCurrentUser: true,
    },
    {
      id: 2,
      variant: "government",
      content: "Maintenance notice: Infrastructure repairs on Main Street starting this Friday. Expect minor delays. #PublicWorks",
      department: "Public Works Department",
      username: "PWD_Official",
      timeAgo: "4h ago",
      likeCount: 156,
      commentCount: 23,
      shareCount: 89,
      isGovernmentBroadcast: true,
      broadcastScope: "AREA",
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState(false);

  const fetchPage = useCallback(
    async (cursor: number | null, replace: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const params = new URLSearchParams({ size: String(FEED_SIZE) });
        if (cursor !== null) params.set("lastPostId", String(cursor));
        const res = await fetch(`/api/v1/feed/${tab}?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 401 || res.status === 403) {
          setFatalError(true);
          setHasMore(false);
          throw new Error("Not authenticated — please log in.");
        }
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          setFatalError(true);
          setHasMore(false);
          throw new Error(`API unreachable (${res.status}). Check your Vite proxy.`);
        }
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data: PaginatedResponse<SocialPostDto> = await res.json();
        const mapped = (data.content ?? []).map(toPostCardPost);
        setPosts((prev) => (replace ? mapped : [...prev, ...mapped]));
        setHasMore(data.hasMore ?? false);
        setNextCursor(data.nextCursor ?? null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load feed");
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    // [UI_DEV_MOCK] Keep mock data visible for now
  }, [tab]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !fatalError) fetchPage(nextCursor, false);
  }, [loading, hasMore, fatalError, nextCursor, fetchPage]);

  const retry = useCallback(() => {
    setFatalError(false);
    fetchPage(null, true);
  }, [fetchPage]);

  const updatePost = useCallback((postId: number, changes: Partial<AnyPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? ({ ...p, ...changes } as AnyPost) : p))
    );
  }, []);

  return { posts, loading, initialLoading, hasMore, error, fatalError, loadMore, retry, updatePost };
}

function InfiniteScrollTrigger({ onIntersect }: { onIntersect: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onIntersect);
  useEffect(() => { cbRef.current = onIntersect; }, [onIntersect]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) cbRef.current(); },
      { threshold: 0.1, rootMargin: "0px 0px 200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="h-4" />;
}

const SOURCE_TABS: { key: "all" | "location" | "following"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "location", label: "Location" },
  { key: "following", label: "Following" },
];

const SORT_TABS: { key: "hot" | "new" | "top"; label: string; icon: any }[] = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: ArrowUp },
];

const Home = () => {
  const [sourceTab, setSourceTab] = useState<"all" | "location" | "following">("all");
  const [sortTab, setSortTab] = useState<"hot" | "new" | "top">("hot");
  const [pincode, setPincode] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  
  const getBackendTab = (): FeedTab => {
    if (sourceTab === "all") return sortTab;
    if (sourceTab === "location") return "for-you";
    return sourceTab;
  };

  const { posts, loading, initialLoading, hasMore, error, fatalError, loadMore, retry, updatePost } =
    useFeed(getBackendTab());

  const handleLike = useCallback((postId: number, liked: boolean) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    updatePost(postId, { isLikedByCurrentUser: liked, likeCount: post.likeCount + (liked ? 1 : -1) });
  }, [posts, updatePost]);

  const handleSave = useCallback((postId: number, saved: boolean) => {
    updatePost(postId, { isSaved: saved } as Partial<AnyPost>);
  }, [updatePost]);

  const handleShare = useCallback((postId: number) => {
    navigator.clipboard?.writeText(`${window.location.origin}/post/${postId}`).catch(() => {});
  }, []);

  const handleComment = useCallback((postId: number) => {
    window.location.href = `/post/${postId}`;
  }, []);

  return (
    <div className="space-y-4">
      <div className="sticky top-2 z-30">
        <div className="flex flex-col gap-2 rounded-2xl border border-base-300 bg-base-100/90 p-2 backdrop-blur-md shadow-sm lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          
          {/* Mobile Top Header (Toggle) */}
          <div className="flex lg:hidden items-center justify-between px-2 py-1">
            <span className="text-sm font-bold opacity-60">Feed Filters</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm font-bold ${
                showFilters ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-base-200 border-base-300 text-base-content/70"
              }`}
            >
              <SlidersHorizontal size={16} />
              {showFilters ? "Hide" : "Explore"}
            </button>
          </div>

          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : false}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:w-full lg:gap-4"
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Source Tabs */}
                  <div className="flex gap-1 bg-base-200/50 p-1 rounded-xl w-full lg:w-auto">
                    {SOURCE_TABS.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setSourceTab(t.key)}
                        className={`flex-1 lg:flex-none rounded-lg px-4 py-1.5 text-sm font-bold transition-all whitespace-nowrap ${
                          sourceTab === t.key 
                            ? "bg-blue-600 text-white shadow-md" 
                            : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort Toggle (Mobile only, visible when filters are expanded) */}
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className={`lg:hidden flex items-center justify-center p-2 h-[38px] w-[38px] rounded-xl border transition-all ${
                      showSort ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-base-200 border-base-300 text-base-content/60"
                    }`}
                  >
                    <Clock size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4 lg:flex-1 lg:justify-end">
                  {/* Center: Pincode Input */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-base-100 border border-base-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <MapPin size={18} className="text-base-content/40" />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="bg-transparent text-sm w-full lg:w-24 outline-none placeholder:text-base-content/30 font-medium"
                    />
                  </div>

                  {/* Right: Sort Tabs (Desktop always, Mobile toggled) */}
                  <AnimatePresence>
                    {(showSort || window.innerWidth >= 1024) && (
                      <motion.div 
                        initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex gap-1 bg-base-200/50 p-1 rounded-xl lg:bg-transparent lg:p-0 overflow-hidden"
                      >
                        <div className="flex gap-1 bg-base-200/50 p-1 rounded-xl w-full lg:w-auto">
                          {SORT_TABS.map((t) => (
                            <button
                              key={t.key}
                              onClick={() => { setSortTab(t.key); if (window.innerWidth < 1024) setShowSort(false); }}
                              className={`flex flex-1 lg:flex-none items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
                                sortTab === t.key 
                                  ? "bg-blue-600 text-white shadow-md" 
                                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                              }`}
                            >
                              <t.icon size={16} />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error flex items-center justify-between gap-3">
          <span>{error}</span>
          {fatalError ? (
            <a href="/login" className="shrink-0 underline font-medium">Log in</a>
          ) : (
            <button className="shrink-0 underline font-medium" onClick={retry}>Retry</button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {initialLoading ? (
          Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 && !loading && !error ? (
          <EmptyState title="Nothing here yet" description="Be the first to post, or try a different tab." />
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} onShare={handleShare} onComment={handleComment} />
          ))
        )}

        {!initialLoading && loading &&
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={`more-${i}`} />)}

        {!initialLoading && hasMore && !loading && !error && (
          <InfiniteScrollTrigger onIntersect={loadMore} />
        )}

        {!hasMore && posts.length > 0 && !error && (
          <p className="py-4 text-center text-xs opacity-40">You've reached the end.</p>
        )}
      </div>
    </div>
  );
};

export default Home;