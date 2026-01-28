import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MainLayout from "../components/layout/MainLayout";

// Pages
import Home from "../pages/Home";
import Communities from "../pages/Communities";
import CommunityFeed from "../pages/CommunityFeed";
import DepartmentFeed from "../pages/DepartmentFeed";
import Messages from "../pages/Messages";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Page transition wrapper
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

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />

        {/* App routes with layout */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            }
          />

          <Route
            path="/communities"
            element={
              <PageWrapper>
                <Communities />
              </PageWrapper>
            }
          />
          <Route
            path="/communities/:slug"
            element={
              <PageWrapper>
                <CommunityFeed />
              </PageWrapper>
            }
          />

          <Route
            path="/department-feed"
            element={
              <PageWrapper>
                <DepartmentFeed />
              </PageWrapper>
            }
          />

          <Route
            path="/messages"
            element={
              <PageWrapper>
                <Messages />
              </PageWrapper>
            }
          />

          <Route
            path="/profile"
            element={
              <PageWrapper>
                <Profile />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
