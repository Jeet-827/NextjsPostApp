"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useRef, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import nextDynamic from "next/dynamic";
import { X, MessageCircle, Heart, BarChart2, Share } from "lucide-react";

const CommentsModal = nextDynamic(() => import("../components/CommentsModal"), {
  ssr: false,
});
const FollowListModal = nextDynamic(() => import("../components/FollowListModal"), {
  ssr: false,
});

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const fileInputRef = useRef(null);

  const { user: reduxUser, loading: authLoading } = useSelector((state) => state.auth);
  const currentUserId = reduxUser?.id || reduxUser?._id;

  const isOwnProfile = !profileId || profileId === currentUserId;
  const [isFollowingState, setIsFollowingState] = useState(false);

  useEffect(() => {
    if (!authLoading && !reduxUser) {
      router.push("/register");
    }
  }, [reduxUser, authLoading, router]);

  useEffect(() => {
    if (userData && currentUserId) {
      const following = userData.follower?.some(f => 
        (f._id || f).toString() === currentUserId.toString()
      );
      setIsFollowingState(following);
    }
  }, [userData, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !userData) return;
    try {
      const res = await axios.post("/api/auth/follow", { targetUserId: userData._id });
      if (res.status === 200) {
        setIsFollowingState(res.data.isFollowing);
        setUserData(prev => {
          const updatedFollowers = res.data.isFollowing
            ? [...(prev.follower || []), { _id: currentUserId }]
            : (prev.follower || []).filter(f => (f._id || f).toString() !== currentUserId.toString());
          return { ...prev, follower: updatedFollowers };
        });
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  useEffect(() => {
    if (!reduxUser) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const url = profileId ? `/api/profile?id=${profileId}` : "/api/profile";
        const res = await axios.get(url);
        setUserData(res.data.user);
        setUserPosts(res.data.posts || []);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reduxUser, profileId]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("bio", editBio);
      if (editImage) {
        formData.append("image", editImage);
      }

      const res = await axios.post("/api/auth/editprofile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        // Optimistically update
        setUserData((prev) => ({
          ...prev,
          bio: editBio,
          profile: editPreview || prev.profile,
          image: editPreview || prev.image,
        }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Edit profile error:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePostForComments) return;

    try {
      setSubmittingComment(true);
      const res = await axios.post(
        "/api/post/comment",
        {
          postId: activePostForComments._id,
          comments: commentInput
        }
      );

      if (res.status === 201) {
        const newComment = res.data.comment;
        
        setUserPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p._id === activePostForComments._id) {
              const currentComments = p.comment || [];
              return {
                ...p,
                comment: [...currentComments, newComment]
              };
            }
            return p;
          })
        );

        setActivePostForComments((prev) => ({
          ...prev,
          comment: [...(prev.comment || []), newComment]
        }));

        setCommentInput("");
      }
    } catch (error) {
      console.error("Post comment error:", error);
      alert("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUserId) return;
    try {
      const res = await axios.post('/api/auth/like', { postId });
      if (res.status === 200) {
        setUserPosts((prev) => 
          prev.map(post => {
            if (post._id === postId) {
              return { 
                ...post, 
                localLikeCount: res.data.likeCount, 
                localIsLiked: res.data.isLiked 
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const openEditModal = () => {
    setEditBio(userData.bio || "");
    setEditPreview(userData.image || userData.profile || "");
    setEditImage(null);
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <title>{`${userData.username} (@${userData.username}) | NextPost`}</title>
      <div className="max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={userData.image || "https://i.pravatar.cc/150"}
                alt="profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-white"
              />

              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-black"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h1 className="text-4xl font-bold tracking-wide">
                  {userData.username}
                </h1>

                {isOwnProfile ? (
                  <button onClick={openEditModal} className="px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition cursor-pointer">
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleFollowToggle} 
                    className={`px-6 py-2 rounded-full font-semibold transition cursor-pointer ${
                      isFollowingState
                        ? "bg-transparent border border-zinc-600 text-white hover:border-red-500 hover:text-red-400"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {isFollowingState ? "Following" : "Follow"}
                  </button>
                )}
              </div>

              <p className="text-zinc-400 mt-2 text-lg">@{userData.username}</p>

              <p className="mt-5 text-zinc-200 leading-relaxed max-w-2xl">
                {userData.email}
              </p>

              {userData.bio && (
                <p className="mt-3 text-zinc-300 italic max-w-2xl">
                  {userData.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
                <div className="bg-white text-black px-6 py-3 rounded-2xl min-w-[120px]">
                  <h2 className="text-2xl font-bold">{userPosts.length}</h2>
                  <p className="text-sm font-medium">Posts</p>
                </div>

                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="border border-zinc-700 px-6 py-3 rounded-2xl min-w-[120px] hover:bg-zinc-900 transition cursor-pointer text-left"
                >
                  <h2 className="text-2xl font-bold">{userData.follower?.length || 0}</h2>
                  <p className="text-sm text-zinc-400">Followers</p>
                </button>

                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="border border-zinc-700 px-6 py-3 rounded-2xl min-w-[120px] hover:bg-zinc-900 transition cursor-pointer text-left"
                >
                  <h2 className="text-2xl font-bold">{userData.following?.length || 0}</h2>
                  <p className="text-sm text-zinc-400">Following</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">All Posts</h2>

            <button className="border border-zinc-700 px-5 py-2 rounded-xl hover:bg-white hover:text-black transition cursor-pointer">
              View Archive
            </button>
          </div>

          {userPosts.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 border border-zinc-800 rounded-3xl">
              No posts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="group bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden hover:scale-[1.02] transition duration-300"
                >
                  <div className="overflow-hidden">
                    {post.images && post.images.length > 0 ? (
                      <img
                        src={post.images[0]}
                        alt="post"
                        className="w-full h-72 object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-72 bg-zinc-900 flex items-center justify-center text-zinc-500">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-zinc-200 leading-relaxed truncate">
                      {post.title}
                    </p>

                    <div className="flex items-center justify-between mt-5 text-zinc-400 text-xs">
                      <button 
                        onClick={() => handleLike(post._id)} 
                        className="cursor-pointer flex items-center gap-1 hover:text-red-500 transition"
                      >
                        <Heart 
                          size={14} 
                          fill={(post.localIsLiked !== undefined ? post.localIsLiked : (currentUserId && post.like?.includes(currentUserId))) ? "red" : "none"} 
                          color={(post.localIsLiked !== undefined ? post.localIsLiked : (currentUserId && post.like?.includes(currentUserId))) ? "red" : "currentColor"} 
                        />
                        <span>{post.localLikeCount !== undefined ? post.localLikeCount : (post.like?.length || 0)}</span>
                      </button>
                      <button 
                        onClick={() => setActivePostForComments(post)}
                        className="cursor-pointer flex items-center gap-1 hover:text-white transition"
                      >
                        <MessageCircle size={14} />
                        <span>{post.comment?.length || 0}</span>
                      </button>
                      <div className="flex items-center gap-1 text-zinc-500" title="Views">
                        <BarChart2 size={14} />
                        <span>{post.views?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500" title="Shares">
                        <Share size={14} />
                        <span>{post.shares || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full relative">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <img
                    src={editPreview || "https://i.pravatar.cc/150"}
                    alt="preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-zinc-700 group-hover:opacity-70 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">Change</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-white transition resize-none h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CommentsModal
        activePostForComments={activePostForComments}
        onClose={() => {
          setActivePostForComments(null);
          setCommentInput("");
        }}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        handlePostComment={handlePostComment}
        submittingComment={submittingComment}
      />

      {/* Followers Modal */}
      <FollowListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        list={userData?.follower || []}
        emptyMessage="No followers yet"
      />

      {/* Following Modal */}
      <FollowListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        list={userData?.following || []}
        emptyMessage="Not following anyone yet"
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading profile...</p>
      </div>
    }>
      <UserProfile />
    </Suspense>
  );
}
