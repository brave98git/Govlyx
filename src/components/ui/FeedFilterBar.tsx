import { Flame, Clock, ArrowUp } from "lucide-react";

const FeedFilterBar = () => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-base-200 p-2">

      {/* Left filters */}
      <div className="flex gap-2">
        <button className="btn btn-sm btn-primary bg-blue-700">All</button>
        <button className="btn btn-sm btn-ghost ">Location</button>
        <button className="btn btn-sm btn-ghost">Following</button>
      </div>

      {/* Sort options */}
      <div className="flex gap-2">
        <button className="btn btn-sm btn-ghost gap-1">
          <Flame size={16} />
          Hot
        </button>
        <button className="btn btn-sm btn-ghost gap-1">
          <Clock size={16} />
          New
        </button>
        <button className="btn btn-sm btn-ghost gap-1">
          <ArrowUp size={16} />
          Top
        </button>
      </div>

    </div>
  );
};

export default FeedFilterBar;
