"use client";

import React from "react";
import {
  Home,
  Search,
  Users,
  Bell,
  User,
  LogOut,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearUser } from "../store/features/authSlice";
import { signOut } from "next-auth/react";
import axios from "axios";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // Hide the sidebar on auth pages
  if (pathname === "/" || pathname === "/register") {
    return null;
  }

  const isActive = (path) => pathname?.toLowerCase() === path.toLowerCase();

  return (
    <div className="w-[290px] h-screen bg-black border-r border-zinc-800 flex flex-col justify-between p-6 shrink-0">

      {/* Top */}
      <div>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-14">

          {/* Custom Logo */}
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-lg">

            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 7C9 5 15 5 17 7"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M17 17C15 19 9 19 7 17"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M5 10C5 8 7 7 9 8L15 12C17 13 17 15 15 16C13 17 11 17 9 16"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>

          <h1 className="text-3xl font-bold text-white tracking-wide">
            POSTAPP
          </h1>

        </div>

        <div className="space-y-3">

          <Link
            href="/home"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
              isActive("/home")
                ? "bg-white text-black shadow-xl"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Home size={24} />
            <span className={`text-lg ${isActive("/home") ? "font-semibold" : "font-medium"}`}>
              Home
            </span>
          </Link>

          <Link
            href="/explore"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
              isActive("/explore")
                ? "bg-white text-black shadow-xl"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Search size={24} />
            <span className={`text-lg ${isActive("/explore") ? "font-semibold" : "font-medium"}`}>
              Explore
            </span>
          </Link>

          <Link
            href="/following"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
              isActive("/following")
                ? "bg-white text-black shadow-xl"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Users size={24} />
            <span className={`text-lg ${isActive("/following") ? "font-semibold" : "font-medium"}`}>Following</span>
          </Link>

          <Link
            href="/notifications"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
              isActive("/notifications")
                ? "bg-white text-black shadow-xl"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Bell size={24} />
            <span className={`text-lg ${isActive("/notifications") ? "font-semibold" : "font-medium"}`}>Notifications</span>
          </Link>

          <Link
            href="/profile"
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition ${
              isActive("/profile")
                ? "bg-white text-black shadow-xl"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <User size={24} />
            <span className={`text-lg ${isActive("/profile") ? "font-semibold" : "font-medium"}`}>
              Profile
            </span>
          </Link>

        </div>

      </div>

      <div>

        <Link
          href="/post"
          className="w-full bg-white text-black py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-semibold hover:bg-zinc-200 transition"
        >
          <Plus size={24} />
          <span>Create Post</span>
        </Link>

        <button
          onClick={async () => {
            try {
              await axios.post("/api/auth/logout");
            } catch (err) {
              console.error("Logout API failed:", err);
            }
            try {
              await signOut({ redirect: false });
            } catch (err) {
              console.error("NextAuth signOut failed:", err);
            }
            dispatch(clearUser());
            router.push("/register");
          }}
          className="mt-8 w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
        >
          <LogOut size={24} />
          <span className="text-lg font-semibold">Logout</span>
        </button>

      </div>

    </div>
  );
};

export default Sidebar;