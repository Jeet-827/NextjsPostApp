"use client";

import React from "react";
import { X } from "lucide-react";

const CommentsModal = ({
  activePostForComments,
  onClose,
  commentInput,
  setCommentInput,
  handlePostComment,
  submittingComment,
}) => {
  if (!activePostForComments) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm cursor-pointer"
      />

      {/* Right Sliding Sidebar */}
      <div 
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl z-50 p-6"
        style={{
          animation: "slideIn 0.3s ease-out forwards"
        }}
      >
        {/* Inject dynamic CSS animation */}
        <style jsx>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
          <h2 className="text-xl font-bold">Replies</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Post Context */}
        <div className="p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl mb-4 text-sm text-zinc-300 leading-normal max-h-24 overflow-y-auto">
          <span className="font-semibold text-white">@{activePostForComments.userId?.username || "user"}: </span>
          {activePostForComments.title}
        </div>

        {/* Comments Scrollable Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
          {(!activePostForComments.comment || activePostForComments.comment.length === 0) ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              No replies yet. Be the first to reply!
            </div>
          ) : (
            activePostForComments.comment.map((comm) => (
              <div key={comm._id} className="flex gap-3 items-start border-b border-zinc-900 pb-3 last:border-b-0">
                <img 
                  src={comm.userId?.image || "https://i.pravatar.cc/150"} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {comm.userId?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-zinc-300 mt-1 leading-relaxed">
                    {comm.comments}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handlePostComment} className="flex gap-3 pt-3 border-t border-zinc-800/80">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Post your reply..."
            className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white transition placeholder:text-zinc-500"
          />
          <button 
            type="submit" 
            disabled={submittingComment || !commentInput.trim()} 
            className="px-5 py-3 bg-white text-black font-semibold text-sm rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {submittingComment ? "Replying..." : "Reply"}
          </button>
        </form>

      </div>
    </>
  );
};

export default CommentsModal;
