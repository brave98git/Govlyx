import { Flame, MapPin, Dice5 } from "lucide-react";
import { NavLink } from "react-router-dom";

const SidebarRight = () => {
  return (
    <aside className="flex h-full flex-col gap-6">
      {/* Trending Topics */}
      <div className="rounded-xl bg-base-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Flame size={18} className="text-primary" />
          <h3 className="font-semibold">Trending</h3>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>#DelhiRains</span>
            <span className="opacity-60">1.2k</span>
          </li>
          <li className="flex justify-between">
            <span>#TechHelp</span>
            <span className="opacity-60">856</span>
          </li>
          <li className="flex justify-between">
            <span>#LocalIssues</span>
            <span className="opacity-60">634</span>
          </li>
        </ul>
      </div>

      {/* Local Updates */}
      <div className="rounded-xl bg-base-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-secondary" />
          <h3 className="font-semibold">Local Updates</h3>
        </div>

        <ul className="space-y-2 text-sm opacity-80">
          <li>Road repair ongoing</li>
          <li>Water supply scheduled</li>
          <li>Community meet tomorrow</li>
        </ul>
      </div>

      {/* Quick Chat */}
      <div className="rounded-xl bg-base-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Dice5 size={18} className="text-accent" />
          <h3 className="font-semibold">Quick Chat</h3>
        </div>

        <button className="btn btn-primary bg-blue-700 btn-sm w-full">
          Find someone to talk
        </button>

        <p className="mt-2 text-center text-xs opacity-60">347 people online</p>
      </div>

      <div className="rounded-xl bg-base-200 p-4">
        <h3 className="font-semibold text-sm mb-2">Official Updates</h3>
        <NavLink
          to="/department-feed"
          className="text-sm text-blue-700 hover:underline"
        >
          View government announcements →
        </NavLink>
      </div>
    </aside>
  );
};

export default SidebarRight;
