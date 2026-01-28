import CommunityCard from "../components/community/CommunityCard";

const mockCommunities = [
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    description: "Local discussions and civic issues",
    members: 2340,
  },
  {
    slug: "tech-support-india",
    name: "Tech Support India",
    description: "Programming, laptops, careers",
    members: 5120,
  },
];

const Community = () => {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold">Communities</h1>
        <p className="text-sm opacity-70">
          Discover and join communities based on your interests.
        </p>
      </div>

      {/* Search (UI only) */}
      <input
        type="text"
        placeholder="Search communities..."
        className="input input-bordered w-full"
      />

      {/* Community cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {mockCommunities.map((community) => (
          <CommunityCard
            key={community.slug}
            slug={community.slug}
            name={community.name}
            description={community.description}
            members={community.members}
          />
        ))}
      </div>
    </div>
  );
};

export default Community;
