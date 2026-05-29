"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const FollowListModal = ({ isOpen, onClose, title, list, emptyMessage }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleProfileClick = (userId) => {
    onClose();
    router.push(`/profile?id=${userId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full relative max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {(!list || list.length === 0) ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              {emptyMessage}
            </div>
          ) : (
            list.map((user) => (
              <div 
                key={user._id} 
                onClick={() => handleProfileClick(user._id)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-800/55 cursor-pointer transition select-none"
              >
                <img
                  src={user.image || "https://i.pravatar.cc/150"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0 hover:opacity-85 transition"
                />
                <div className="flex-1 min-w-0 group">
                  <h3 className="font-bold text-white text-sm group-hover:underline truncate">{user.username}</h3>
                  {user.bio && (
                    <p className="text-xs text-zinc-400 truncate">{user.bio}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
