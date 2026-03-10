import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MainLayout from "../components/layout/MainLayout";

// Pages
import Home from "../pages/Home";
import Communities from "../pages/Communities";
import DepartmentFeed from "../pages/DepartmentFeed";
import QuickChatPage from "../pages/QuickChatPage";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Invite accept page — exported from Community.tsx
// Route: /invite/:token
// Public page: works without login (shows preview), requires login to accept
import { AcceptInvitePage } from "../pages/Communities";

// ── Page transition wrapper ───────────────────────────────────────────────────
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const isLoggedIn = () => {
  /* [DEV_BYPASS] Toggle these lines to switch between Demo and Real Auth */
  return true; // Demo: Always logged in
  // return !!localStorage.getItem("token"); // Real: Check local storage
};

// ── Router ────────────────────────────────────────────────────────────────────
const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public auth routes ── */}
        <Route
          path="/login"
          element={
            isLoggedIn()
              ? <Navigate to="/" replace />
              : <PageWrapper><Login /></PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn()
              ? <Navigate to="/" replace />
              : <PageWrapper><Register /></PageWrapper>
          }
        />

        {/*
          ── Invite accept route ──────────────────────────────────────────────
          PUBLIC — no auth required to VIEW the invite preview.
          Auth IS required to ACCEPT (the page redirects to /login?redirect=...
          if the user is not logged in and clicks "Accept & Join").

          This route must be OUTSIDE the protected <MainLayout /> wrapper so
          that unauthenticated users can see the invite details page before
          deciding to log in.

          Backend endpoint called (no auth):
            GET /api/communities/invites/preview/{token}

          Backend endpoint called (auth required):
            POST /api/communities/invites/accept/{token}

          The token value comes from the URL param set in inviteLink:
            https://jansahayak.in/invite/{token}
        */}
        <Route
          path="/invite/:token"
          element={
            <PageWrapper>
              <AcceptInvitePage />
            </PageWrapper>
          }
        />

        {/* ── Protected routes ── */}
        <Route
          element={isLoggedIn() ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/"                element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/communities"     element={<PageWrapper><Communities /></PageWrapper>} />
          <Route path="/department-feed" element={<PageWrapper><DepartmentFeed /></PageWrapper>} />
          <Route path="/quick-chat"      element={<PageWrapper><QuickChatPage /></PageWrapper>} />
          <Route path="/profile"         element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/settings"        element={<PageWrapper><Settings /></PageWrapper>} />
        </Route>

        {/* ── Fallback ── */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn() ? "/" : "/login"} replace />}
        />

      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;