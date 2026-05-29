"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";

const UserCard = React.memo(({ user, isFollowing, onFollow }) => {
  const router = useRouter();

  const handleProfileClick = () => {
    if (user._id) {
      router.push(`/profile?id=${user._id}`);
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-zinc-950/60 transition text-white"
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

      {/* Follow Button */}
      <button
        onClick={() => onFollow(user._id)}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition shrink-0 cursor-pointer ${
          isFollowing
            ? "bg-transparent border border-zinc-600 text-white hover:border-red-500/50 hover:text-red-400"
            : "bg-white text-black hover:bg-zinc-200"
        }`}
      >
        {isFollowing ? (
          <span className="flex items-center gap-1.5">
            <UserCheck size={14} />
            Following
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <UserPlus size={14} />
            Follow
          </span>
        )}
      </button>
    </div>
  );
});

UserCard.displayName = "UserCard";

export default UserCard;
