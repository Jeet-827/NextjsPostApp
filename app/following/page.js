"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import { UserMinus, Users, Loader } from "lucide-react";
import FollowingCard from "../components/FollowingCard";

const FollowingPage = () => {
  const router = useRouter();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState(null);

  const { user, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/auth/following");
        setFollowing(res.data.following || []);
      } catch (error) {
        console.error("Fetch following error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [user]);

  const handleUnfollow = useCallback(async (targetUserId) => {
    if (!user) return;

    try {
      setUnfollowingId(targetUserId);
      const res = await axios.post(
        "/api/auth/follow",
        { targetUserId }
      );

      if (res.status === 200 && !res.data.isFollowing) {
        // Remove from list with animation delay
        setTimeout(() => {
          setFollowing((prev) =>
            prev.filter((user) => user._id !== targetUserId)
          );
          setUnfollowingId(null);
        }, 300);
      } else {
        setUnfollowingId(null);
      }
    } catch (error) {
      console.error("Unfollow error:", error);
      setUnfollowingId(null);
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-2xl border-x border-zinc-800">
        {/* Header */}
        <div className="sticky top-14 md:top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
          <h1 className="text-2xl font-bold">Following</h1>
          {!loading && (
            <p className="text-sm text-zinc-500 mt-1">
              {following.length} {following.length === 1 ? "person" : "people"}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader size={28} className="text-zinc-500 animate-spin mb-4" />
            <p className="text-zinc-500 text-sm">Loading...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && following.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <Users size={32} className="text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-300 mb-2">
              Not following anyone yet
            </h2>
            <p className="text-sm text-zinc-500 max-w-xs mb-6">
              Find people to follow on the Explore page
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="px-6 py-2.5 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition cursor-pointer"
            >
              Explore Users
            </button>
          </div>
        )}

        {/* Following List */}
        <div className="divide-y divide-zinc-800/50">
          {following.map((user) => (
            <FollowingCard
              key={user._id}
              user={user}
              isUnfollowing={unfollowingId === user._id}
              onUnfollow={handleUnfollow}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default FollowingPage;
