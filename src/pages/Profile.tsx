import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import ProfileTabs from "../components/profile/ProfileTabs";
import EmptyState from "../components/ui/EmptyState";

const Profile = () => {
  const [tab, setTab] = useState<"posts" | "about" | "activity">("posts");

  return (
    <div className="space-y-4">

      {/* Profile Header */}
      <div className="rounded-xl border border-base-300 bg-base-200 p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
            A
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">
                Anonymous #4821
              </h1>
              <ShieldCheck size={16} className="text-blue-700" />
            </div>

            <p className="text-sm opacity-70">
              Member since Jan 2026 • India
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-base-200 p-3 text-center">
          <p className="text-lg font-semibold">24</p>
          <p className="text-xs opacity-70">Posts</p>
        </div>
        <div className="rounded-xl bg-base-200 p-3 text-center">
          <p className="text-lg font-semibold">132</p>
          <p className="text-xs opacity-70">Comments</p>
        </div>
        <div className="rounded-xl bg-base-200 p-3 text-center">
          <p className="text-lg font-semibold">3</p>
          <p className="text-xs opacity-70">Communities</p>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs active={tab} onChange={setTab} />

      {/* Tab Content */}
      {tab === "posts" && (
        <EmptyState
          title="No posts yet"
          description="Posts created by you will appear here."
        />
      )}

      {tab === "about" && (
        <div className="rounded-xl bg-base-200 p-4 text-sm opacity-70">
          This is an anonymous account. Your identity is protected by design.
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-xl bg-base-200 p-4 text-sm opacity-70">
          Your recent interactions and activity will appear here.
        </div>
      )}
    </div>
  );
};

export default Profile;
