import { NavLink } from "react-router-dom";
import { Search, Bell, MessageCircle, Plus, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

import CreatePost from "../ui/CreatePost";

const Navbar = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <motion.header
      className="fixed top-0 z-40 w-full border-b border-base-300 bg-base-200"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto flex h-14 max-w-[1460px] items-center gap-3 px-4">
        {/* MOBILE MENU */}
        <label
          htmlFor="mobile-drawer"
          className="btn btn-ghost btn-sm lg:hidden"
        >
          <Menu size={20} />
        </label>

        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 540">
              <path
                fill="#1D4ED8"
                d="M256 32L96 112v120c0 112 64 208 160 248c96-40 160-136 160-248V112L256 32z"
              />

              <g fill="#FFFFFF" transform="translate(0, -6)">
                <path d="M256 150c-40 0-72 32-72 72v20h144v-20c0-40-32-72-72-72z" />
                <rect x="220" y="242" width="72" height="16" />
                <rect x="204" y="220" width="12" height="40" />
                <rect x="296" y="220" width="12" height="40" />
              </g>

              <g fill="#FFFFFF" transform="translate(0, -6)">
                <circle cx="170" cy="210" r="6" />
                <circle cx="196" cy="230" r="4" />
                <circle cx="342" cy="210" r="6" />
                <circle cx="318" cy="230" r="4" />
                <circle cx="256" cy="190" r="5" />
              </g>

              <path fill="#FFFFFF" d="M150 300h212l-8 16H158z" />

              <g fill="#FFFFFF">
                <rect x="248" y="300" width="16" height="120" />
                <rect x="198" y="300" width="16" height="80" />
                <rect x="298" y="300" width="16" height="80" />
              </g>

              <g fill="#FFFFFF">
                <circle cx="256" cy="440" r="18" />
                <circle cx="206" cy="380" r="20" />
                <circle cx="306" cy="380" r="20" />
              </g>

              <g>
                <rect x="252" y="118" width="8" height="32" fill="#FFFFFF" />
                <path d="M260 118h45v22l-45-8z" fill="#FFFFFF" />
                <path d="M260 118l35 16l-35-6z" fill="#FFFFFF" opacity="0.4" />
              </g>
            </svg>
          </div>
          <span className="hidden sm:block text-2xl font-bold">Govlyx</span>
        </NavLink>

        {/* DESKTOP SEARCH ONLY */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              type="text"
              placeholder="Search communities, posts..."
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="ml-auto flex items-center gap-2">
          {/* MOBILE SEARCH ICON */}
          <button className="btn btn-ghost btn-sm lg:hidden hover:bg-blue-700/10">
            <Search size={18} />
          </button>

          {/* CREATE */}
          <button
            onClick={() => setOpenCreate(true)}
            className="btn btn-sm bg-blue-700 hidden sm:flex gap-1 text-white"
          >
            <Plus size={16} />
            Create
          </button>

          <NavLink
            to="/messages"
            className="btn btn-ghost btn-sm hover:bg-blue-700/10"
          >
            <MessageCircle size={18} />
          </NavLink>

          <NavLink
            to="/notifications"
            className="btn btn-ghost btn-sm hover:bg-blue-700/10"
          >
            <Bell size={18} />
          </NavLink>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm hover:bg-blue-700/10"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* AVATAR */}
          <NavLink to="/profile" className="avatar placeholder">
            <div className="w-8 rounded-full bg-blue-700 text-white font-mono font-bold flex justify-center pt-1">
              S
            </div>
          </NavLink>
        </div>
        {/* CREATE POST MODAL */}
        <CreatePost open={openCreate} onClose={() => setOpenCreate(false)} />
      </div>
    </motion.header>
  );
};

export default Navbar;
