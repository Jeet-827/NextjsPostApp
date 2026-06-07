"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import { Search, UserPlus, UserCheck, X, Users } from "lucide-react";
import UserCard from "../components/UserCard";

const ExplorePage = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery) => {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (!searchQuery.trim()) {
        setResults([]);
        setSearched(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Set new timer - 300ms debounce
      debounceTimer.current = setTimeout(async () => {
        try {
          const res = await axios.get(
            `/api/explore?q=${encodeURIComponent(searchQuery.trim())}`
          );
          setResults(res.data.users || []);
          setSearched(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleFollow = useCallback(async (targetUserId) => {
    if (!currentUserId) return;

    try {
      const res = await axios.post(
        "/api/auth/follow",
        { targetUserId }
      );

      if (res.status === 200) {
        setResults((prev) =>
          prev.map((user) => {
            if (user._id === targetUserId) {
              const updatedFollower = res.data.isFollowing
                ? [...(user.follower || []), currentUserId]
                : (user.follower || []).filter(
                    (id) => id.toString() !== currentUserId
                  );
              return { ...user, follower: updatedFollower };
            }
            return user;
          })
        );
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  }, [currentUserId]);

  const isFollowing = (user) => {
    return (
      currentUserId &&
      user.follower?.some((id) => id.toString() === currentUserId)
    );
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-2xl border-x border-zinc-800">
        {/* Header */}
        <div className="sticky top-14 md:top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
          <h1 className="text-2xl font-bold mb-4">Explore</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search users..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-10 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 transition placeholder:text-zinc-500"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Debounce indicator */}
          {loading && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs text-zinc-500">Searching...</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="divide-y divide-zinc-800/50">
          {/* No query state */}
          {!searched && !query && !loading && (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Users size={32} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-300 mb-2">
                Discover People
              </h2>
              <p className="text-sm text-zinc-500 max-w-xs">
                Search by username to find and follow other users on PostApp
              </p>
            </div>
          )}

          {/* No results */}
          {searched && results.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Search size={32} className="text-zinc-600" />
              </div>
              <h2 className="text-xl font-bold text-zinc-300 mb-2">
                No users found
              </h2>
              <p className="text-sm text-zinc-500 max-w-xs">
                Try a different search term
              </p>
            </div>
          )}

          {/* User results */}
          {results.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              isFollowing={isFollowing(user)}
              onFollow={handleFollow}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default ExplorePage;
