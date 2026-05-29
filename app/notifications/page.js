"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  Check, 
  CheckCheck,
  ChevronRight,
  Loader2
} from "lucide-react";

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 10) return "just now";
  if (diffInSecs < 60) return `${diffInSecs}s ago`;
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await axios.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (notifications.length === 0 || markingAll) return;
    try {
      setMarkingAll(true);
      await axios.put("/api/notifications");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read in the DB (non-blocking in the UI redirect)
      if (!notification.isRead) {
        axios.put("/api/notifications", { notificationId: notification._id });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      }

      // Navigate based on type
      if (notification.type === "follow") {
        router.push(`/profile?id=${notification.sender._id}`);
      } else if (notification.postId) {
        // Go to home feed or specific post profile view
        router.push(`/profile?id=${notification.receiver}`);
      }
    } catch (err) {
      console.error("Failed to process notification click:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "share":
        return <Share2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getNotificationText = (notification) => {
    const username = notification.sender?.username || "Someone";
    switch (notification.type) {
      case "like":
        return (
          <span>
            <strong className="text-white font-semibold hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile?id=${notification.sender._id}`);
            }}>
              {username}
            </strong>{" "}
            liked your post.
          </span>
        );
      case "comment":
        return (
          <span>
            <strong className="text-white font-semibold hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile?id=${notification.sender._id}`);
            }}>
              {username}
            </strong>{" "}
            commented on your post.
          </span>
        );
      case "follow":
        return (
          <span>
            <strong className="text-white font-semibold hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile?id=${notification.sender._id}`);
            }}>
              {username}
            </strong>{" "}
            started following you.
          </span>
        );
      case "share":
        return (
          <span>
            <strong className="text-white font-semibold hover:underline cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile?id=${notification.sender._id}`);
            }}>
              {username}
            </strong>{" "}
            shared your post.
          </span>
        );
      default:
        return <span>Action performed on your account.</span>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-2xl border-x border-zinc-800 flex flex-col min-h-screen">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-zinc-500 mb-4" />
              <p className="text-zinc-500 text-sm">Loading notifications...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-600 animate-pulse">
                <Bell size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-300 mb-2">
                All caught up!
              </h2>
              <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                When people like, comment, share, or follow you, you'll see those notifications here.
              </p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 flex gap-4 items-start cursor-pointer hover:bg-zinc-950/40 transition select-none group relative ${
                  !notification.isRead ? "bg-blue-950/5 border-l-2 border-blue-500" : ""
                }`}
              >
                {/* Visual Unread dot for accessibility */}
                {!notification.isRead && (
                  <span className="absolute top-1/2 -translate-y-1/2 left-2 w-2 h-2 rounded-full bg-blue-500"></span>
                )}

                {/* Left Side: Sender Avatar */}
                <div className="relative shrink-0 ml-1">
                  <img
                    src={notification.sender?.image || "https://i.pravatar.cc/150"}
                    alt="sender avatar"
                    className="w-11 h-11 rounded-full object-cover border border-zinc-800 cursor-pointer hover:opacity-85 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/profile?id=${notification.sender?._id}`);
                    }}
                  />
                  {/* Action Badge Badge overlay */}
                  <div className="absolute -bottom-1 -right-1 bg-zinc-950 p-1 rounded-full border border-zinc-800">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Center Content details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 leading-snug">
                    {getNotificationText(notification)}
                  </p>
                  
                  {/* Relative timestamp */}
                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                    {formatRelativeTime(notification.createdAt)}
                  </p>

                  {/* Post Preview text block if applicable */}
                  {notification.postId && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 font-medium truncate max-w-md group-hover:border-zinc-800 transition">
                      Post: {notification.postId.title || "Image content"}
                    </div>
                  )}
                </div>

                {/* Right Arrow indicator */}
                <div className="shrink-0 self-center text-zinc-600 group-hover:text-zinc-400 transition pr-1">
                  <ChevronRight className="w-5 h-5" />
                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
