"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Home, Search, Users, Bell, User, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../store/features/authSlice";
import axios from "axios";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pollIntervalRef = useRef(null);

  // Lightweight poll — only fetches the count, not full notification objects
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get("/api/notifications?unreadOnly=true");
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      // Silent fail — badge stays as-is on network errors
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30_000); // poll every 30s
    return () => clearInterval(pollIntervalRef.current);
  }, [user, fetchUnreadCount]);

  // Clear badge instantly when user navigates to /notifications
  useEffect(() => {
    if (pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [pathname]);

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Hide sidebar/mobile header on auth pages
  if (pathname === "/" || pathname === "/register") return null;

  const isActive = (path) => pathname?.toLowerCase() === path.toLowerCase();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    dispatch(clearUser());
    router.push("/register");
  };

  const NavLink = ({ href, icon: Icon, label, badge }) => (
    <Link
      href={href}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
        isActive(href)
          ? "bg-white text-black shadow-xl"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {/* Icon with optional red badge overlay */}
      <div className="relative shrink-0">
        <Icon size={24} />
        {badge > 0 && (
          <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-lg animate-pulse">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className={`text-lg ${isActive(href) ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <>
      {/* Global Mobile Padding Injection */}
      <style>{`
        @media (max-width: 767px) {
          main {
            padding-top: 3.5rem !important;
            padding-bottom: 5.5rem !important;
          }
        }
      `}</style>

      <div className="hidden md:flex w-[290px] h-screen bg-black border-r border-zinc-800 flex flex-col justify-between p-6 shrink-0 sticky top-0">
        {/* Top section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-4 mb-14">
            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-lg">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7C9 5 15 5 17 7" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M17 17C15 19 9 19 7 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 10C5 8 7 7 9 8L15 12C17 13 17 15 15 16C13 17 11 17 9 16" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">POSTAPP</h1>
          </div>

          {/* Nav links */}
          <div className="space-y-3">
            <NavLink href="/home"          icon={Home}   label="Home" />
            <NavLink href="/explore"       icon={Search} label="Explore" />
            <NavLink href="/following"     icon={Users}  label="Following" />
            <NavLink href="/notifications" icon={Bell}   label="Notifications" badge={unreadCount} />
            <NavLink href="/profile"       icon={User}   label="Profile" />
          </div>
        </div>

        {/* Bottom section */}
        <div>
          <Link
            href="/post"
            className="w-full bg-white text-black py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-semibold hover:bg-zinc-200 transition"
          >
            <Plus size={24} />
            <span>Create Post</span>
          </Link>

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
          >
            <LogOut size={24} />
            <span className="text-lg font-semibold">Logout</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE TOP STICKY HEADER                              */}
      {/* ======================================================== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800/80 h-14 flex items-center justify-between px-4">
        {/* User Profile Avatar (Opens Drawer) */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0 focus:outline-none cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <img
            src={user?.image || "https://i.pravatar.cc/150"}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </button>

        {/* App Logo */}
        <Link href="/home" className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 7C9 5 15 5 17 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 17C15 19 9 19 7 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M5 10C5 8 7 7 9 8L15 12C17 13 17 15 15 16C13 17 11 17 9 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          className="text-zinc-400 hover:text-white p-1 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. MOBILE SLIDE-OUT DRAWER                               */}
      {/* ======================================================== */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Drawer Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content Body */}
          <div className="relative w-72 max-w-[80vw] bg-black border-r border-zinc-800 h-full flex flex-col justify-between p-6 shadow-2xl animate-[slideFromLeft_0.25s_ease-out]">
            <style>{`
              @keyframes slideFromLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Top Container */}
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white tracking-wide">Account info</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                  aria-label="Close drawer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* User Bio Card */}
              {user && (
                <div className="mb-8 p-4 rounded-2xl bg-zinc-950 border border-zinc-900 shadow-inner">
                  <Link href="/profile" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 shrink-0">
                      <img
                        src={user.image || "https://i.pravatar.cc/150"}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate hover:underline">{user.username}</h3>
                      <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
                    </div>
                  </Link>
                  {user.bio && (
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{user.bio}</p>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="/home"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                    isActive("/home") ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Home size={22} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/explore"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                    isActive("/explore") ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Search size={22} />
                  <span>Explore</span>
                </Link>
                <Link
                  href="/following"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                    isActive("/following") ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Users size={22} />
                  <span>Following</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                    isActive("/notifications") ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <div className="relative">
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                    isActive("/profile") ? "bg-white text-black font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <User size={22} />
                  <span>Profile</span>
                </Link>
              </div>
            </div>

            {/* Bottom Logout */}
            <div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer font-semibold"
              >
                <LogOut size={22} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MOBILE BOTTOM TAB BAR                                 */}
      {/* ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-md border-t border-zinc-800/80 z-40 flex items-center justify-around px-2">
        <Link
          href="/home"
          className={`p-2.5 transition-colors duration-150 ${isActive("/home") ? "text-white" : "text-zinc-500 hover:text-zinc-400"}`}
          aria-label="Home"
        >
          <Home size={26} />
        </Link>
        <Link
          href="/explore"
          className={`p-2.5 transition-colors duration-150 ${isActive("/explore") ? "text-white" : "text-zinc-500 hover:text-zinc-400"}`}
          aria-label="Explore"
        >
          <Search size={26} />
        </Link>
        <Link
          href="/following"
          className={`p-2.5 transition-colors duration-150 ${isActive("/following") ? "text-white" : "text-zinc-500 hover:text-zinc-400"}`}
          aria-label="Following"
        >
          <Users size={26} />
        </Link>
        <Link
          href="/notifications"
          className={`relative p-2.5 transition-colors duration-150 ${isActive("/notifications") ? "text-white" : "text-zinc-500 hover:text-zinc-400"}`}
          aria-label="Notifications"
        >
          <Bell size={26} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-black animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          className={`p-2.5 transition-colors duration-150 ${isActive("/profile") ? "text-white" : "text-zinc-500 hover:text-zinc-400"}`}
          aria-label="Profile"
        >
          <User size={26} />
        </Link>
      </div>

      {/* ======================================================== */}
      {/* 5. MOBILE FLOATING ACTION BUTTON (FAB)                   */}
      {/* ======================================================== */}
      <Link
        href="/post"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/10 z-40 hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all"
        aria-label="Create new post"
      >
        <Plus size={28} />
      </Link>
    </>
  );
};

export default Sidebar;