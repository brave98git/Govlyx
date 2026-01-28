import { useState } from "react";
import { useParams } from "react-router-dom";

import CommunityHeader from "../components/community/CommunityHeader";
import CommunityTabs from "../components/community/CommunityTabs";
import CommunitySidebar from "../components/community/CommunitySidebar";
import EmptyState from "../components/ui/EmptyState";

/**
 * Temporary mock data
 * Later this will come from API using the slug
 */
const COMMUNITY_MAP: Record<string, {
  name: string;
  description: string;
  members: number;
}> = {
  "delhi-ncr": {
    name: "Delhi NCR",
    description: "Local discussions, civic issues, and updates from Delhi NCR.",
    members: 2340,
  },
  "tech-support-india": {
    name: "Tech Support India",
    description: "Programming, laptops, careers, and technical guidance.",
    members: 5120,
  },
};

const CommunityFeed = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<"posts" | "about">("posts");

  // fallback if slug is invalid
  const community = slug ? COMMUNITY_MAP[slug] : null;

  if (!community) {
    return (
      <EmptyState
        title="Community not found"
        description="The community you are looking for does not exist."
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4">

      {/* CENTER FEED */}
      <div className="col-span-12 lg:col-span-8 space-y-4">

        <CommunityHeader
          name={community.name}
          description={community.description}
          members={community.members}
        />

        <CommunityTabs active={tab} onChange={setTab} />

        {tab === "posts" && (
          <EmptyState
            title="No posts yet"
            description="Be the first to start a discussion in this community."
          />
        )}

        {tab === "about" && (
          <div className="rounded-xl border border-base-300 bg-base-200 p-4">
            <h3 className="font-semibold mb-2">About this community</h3>
            <p className="text-sm opacity-70">
              {community.description}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden lg:block lg:col-span-4">
        <CommunitySidebar />
      </aside>

    </div>
  );
};

export default CommunityFeed;
