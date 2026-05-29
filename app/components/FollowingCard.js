"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader, UserMinus } from "lucide-react";

const FollowingCard = React.memo(({ user, isUnfollowing, onUnfollow }) => {
  const router = useRouter();

  const handleProfileClick = () => {
    if (user._id) {
      router.push(`/profile?id=${user._id}`);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 hover:bg-zinc-950/60 transition text-white ${
        isUnfollowing ? "opacity-50 scale-98" : ""
      }`}
      style={{
        transition: "all 0.3s ease",
      }}
    >
      {/* Avatar */}
      <img
        src={user.image || "https://i.pravatar.cc/150"}
        alt={user.username}
        className="w-12 h-12 rounded-full object-cover border border-zinc-800 shrink-0 cursor-pointer hover:opacity-85 transition"
        onClick={handleProfileClick}
      />

      {/* User Info */}
      <div onClick={handleProfileClick} className="flex-1 min-w-0 cursor-pointer group">
        <h3 className="font-bold text-white group-hover:underline truncate">
          {user.username}
        </h3>
        <p className="text-sm text-zinc-500 truncate">
          @{user.username}
        </p>
        {user.bio && (
          <p className="text-sm text-zinc-400 mt-1 truncate">
            {user.bio}
          </p>
        )}
      </div>

      {/* Unfollow Button */}
      <button
        onClick={() => onUnfollow(user._id)}
        disabled={isUnfollowing}
        className="px-5 py-2 rounded-full text-sm font-semibold border border-zinc-600 text-white hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUnfollowing ? (
          <span className="flex items-center gap-1.5">
            <Loader size={14} className="animate-spin" />
            Unfollowing
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <UserMinus size={14} />
            Unfollow
          </span>
        )}
      </button>
    </div>
  );
});

FollowingCard.displayName = "FollowingCard";

export default FollowingCard;
