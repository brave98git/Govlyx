import FeedFilterBar from "../components/ui/FeedFilterBar";
import PostCard from "../components/post/PostCard";
import GovPostCard from "../components/post/GovPostCard";
import PollPostCard from "../components/post/PollPostCard";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import PulseLoader from "../components/ui/Loader";

const mockPosts = [
  {
    id: 1,
    title: "Need help with property registration",
    author: "@anonymous_421",
    location: "Delhi",
  },
  {
    id: 2,
    title: "Water supply issue in my area",
    author: "@citizen_889",
    location: "Mumbai",
  },
  {
    id: 3,
    title: "Any good coaching for GATE?",
    author: "@student_102",
    location: "Pune",
  },
];

const Home = () => {
  return (
    <div className="space-y-4">
      {/* Feed filters */}
      <FeedFilterBar />

      {/* Feed */}
      <div className="space-y-3">
        <PollPostCard
          author="@survey_taker_889"
          location="Maharashtra"
          question="What's your biggest concern in Mumbai?"
          votes={1247}
          timeLeft="2 days left"
          options={[
            { label: "Traffic congestion", percentage: 45 },
            { label: "Housing costs", percentage: 32, selected: true },
            { label: "Pollution", percentage: 15 },
            { label: "Safety", percentage: 8 },
          ]}
        />

        {mockPosts.map((post) => (
          <PostCard
            key={post.id}
            author={post.author}
            location={post.location}
            title={post.title}
          />
        ))}

        <GovPostCard
          department="Ministry of Health"
          title="COVID-19 Vaccination Drive – Phase 4"
          description="New vaccination centers are opening in your district. Please register through the official portal."
        />

        <PostCard
          author="@citizen_889"
          location="Mumbai"
          title="Water supply issue in my area"
        />
      </div>
      {/* <EmptyState
        title="No posts yet"
        description="Be the first to start a conversation in your area."
      /> */}

      {/* <PulseLoader /> */}
    </div>
  );
};

export default Home;
