"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import {
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
  Share,
  MoreHorizontal,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

const PostCard = React.memo(({ post, currentUserId, onLike, onOpenComments, onShare }) => {
  const [copied, setCopied] = React.useState(false);
  const router = useRouter();

  const handleProfileClick = () => {
    if (post.userId?._id) {
      router.push(`/profile?id=${post.userId._id}`);
    }
  };

  const handleShareClick = () => {
    try {
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
    if (onShare) {
      onShare(post._id);
    }
  };

  const isLiked = post.localIsLiked !== undefined 
    ? post.localIsLiked 
    : (currentUserId && post.like?.includes(currentUserId));

  const likeCount = post.localLikeCount !== undefined 
    ? post.localLikeCount 
    : (post.like?.length || 0);

  return (
    <div className="p-5 border-b border-zinc-800 hover:bg-zinc-950/20 transition text-white">
      {/* Author Header */}
      <div className="flex gap-3 items-center">
        <img
          src={post.userId?.image || "https://i.pravatar.cc/150"}
          alt="profile"
          className="w-11 h-11 rounded-full object-cover border border-zinc-800 cursor-pointer hover:opacity-80 transition"
          onClick={handleProfileClick}
        />

        <div onClick={handleProfileClick} className="cursor-pointer group">
          <h2 className="font-bold group-hover:underline text-white transition">
            {post.userId?.username || "Unknown"}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm text-zinc-500">
              @{post.userId?.username || "user"}
            </p>
            {post.userId?.bio && (
              <>
                <span className="text-zinc-700 text-xs hidden sm:inline">•</span>
                <p className="text-xs text-zinc-400 italic max-w-[200px] truncate" title={post.userId.bio}>
                  {post.userId.bio}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="ml-auto">
          <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Post content */}
      <p className="mt-3 text-zinc-200 leading-7">
        {post.title || ""}
      </p>

      {/* Swiper Image Gallery */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            grabCursor={true}
            simulateTouch={true}
            allowTouchMove={true}
          >
            {post.images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="w-full h-[500px] flex items-center justify-center bg-black">
                  <img
                    src={img}
                    alt="post"
                    className="w-full max-h-[600px] object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Engagement Buttons */}
      <div className="flex justify-between mt-4 text-zinc-500 max-w-md">
        <button 
          onClick={() => onOpenComments(post)} 
          className="cursor-pointer flex items-center gap-2 hover:text-zinc-300 transition"
        >
          <MessageCircle size={18} />
          <span className="text-sm">{post.comment?.length || 0}</span>
        </button>


        <button 
          onClick={() => onLike(post._id)} 
          className="cursor-pointer flex items-center gap-2 hover:text-red-500 transition"
        >
          <Heart 
            size={18} 
            fill={isLiked ? "red" : "none"} 
            color={isLiked ? "red" : "currentColor"} 
          />
          <span className="text-sm">{likeCount}</span>
        </button>

        <div className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition select-none" title="Views">
          <BarChart2 size={18} />
          <span className="text-sm">{post.views?.length || 0}</span>
        </div>

        <button 
          onClick={handleShareClick}
          className={`cursor-pointer flex items-center gap-2 transition ${copied ? "text-green-500 font-medium" : "hover:text-blue-500 text-zinc-500"}`}
          title="Share Post"
        >
          <Share size={18} />
          <span className="text-sm">
            {copied ? "Copied!" : (post.localSharesCount !== undefined ? post.localSharesCount : (post.shares || 0))}
          </span>
        </button>
      </div>
    </div>
  );
});

PostCard.displayName = "PostCard";

export default PostCard;
