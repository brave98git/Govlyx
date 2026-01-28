import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  MessageCircle,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Communities", icon: Users, to: "/communities" },
  { label: "Messages", icon: MessageCircle, to: "/messages" },
  { label: "Profile", icon: User, to: "/profile" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

const SidebarLeft = () => {
  return (
    <aside className="flex h-full flex-col gap-6">

      {/* Profile Card */}
      <div className="rounded-xl bg-base-200 p-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="w-10 rounded-full bg-blue-700 text-primary-content">
              <span className="flex font-bold justify-center pt-0.5 text-3xl">U</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">Anonymous User</p>
            <p className="text-sm opacity-60">Citizen</p>
          </div>
        </div>
      </div>  

      {/* Navigation */}
      <nav className="rounded-xl bg-base-200 p-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
               ${
                 isActive
                   ? "bg-blue-700 text-primary-content"
                   : "hover:bg-base-300"
               }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Communities Placeholder */}
      <div className="rounded-xl bg-base-200 p-4">
        <p className="mb-2 text-sm font-semibold opacity-70">
          Your Communities
        </p>
        <ul className="space-y-2 text-sm opacity-80">
          <li className="truncate">Delhi NCR</li>
          <li className="truncate">Tech Support</li>
          <li className="truncate">Education India</li>
          <li className="truncate">Baramati News</li>
        </ul>
      </div>
    </aside>
  );
};

export default SidebarLeft;
