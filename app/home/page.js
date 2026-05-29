"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import PostCard from "../components/PostCard";

import {
  Heart,
  MessageCircle,
  Repeat2,
  BarChart2,
  Share,
  MoreHorizontal,
  X,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const CommentsModal = dynamic(() => import("../components/CommentsModal"), {
  ssr: false,
});

const Page = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [hashMore, setHashMore] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastFetchedPage = useRef(0);
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    try {
      const cachedPosts = sessionStorage.getItem("home_posts");
      const cachedPage = sessionStorage.getItem("home_page");
      if (cachedPosts) {
        setPosts(JSON.parse(cachedPosts));
        setLoading(false);
      }
      if (cachedPage) {
        const p = parseInt(cachedPage);
        setPage(p);
      }
    } catch (e) {
      console.error("Cache load error", e);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      if (page <= lastFetchedPage.current) return;

      try {
        if (posts.length === 0) {
          setLoading(true);
        }

        const res = await axios.get(`/api/getpost?page=${page}&limit=10`);
        if (res.data.posts.length === 0) {
          setHashMore(false);
        }
        setPosts((prev) => {
          const newPosts = res.data.posts || [];
          
          const updated = prev.map((oldPost) => {
            const freshPost = newPosts.find((p) => p._id === oldPost._id);
            return freshPost ? freshPost : oldPost;
          });

          const trulyNewPosts = newPosts.filter(
            (newPost) => !prev.some((p) => p._id === newPost._id)
          );
          
          const updatedPosts = page === 1 
            ? [...trulyNewPosts, ...updated] 
            : [...updated, ...trulyNewPosts];
            
          sessionStorage.setItem("home_posts", JSON.stringify(updatedPosts));
          sessionStorage.setItem("home_page", page.toString());
          
          return updatedPosts;
        });
        
        lastFetchedPage.current = page;
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, page]);

  const handleLike = useCallback(async (postId) => {
    if (!currentUserId) return;
    try {
      const res = await axios.post('/api/auth/like', { postId });
      if (res.status === 200) {
        setPosts((prev) => {
          const updatedPosts = prev.map(post => {
            if (post._id === postId) {
              return { ...post, localLikeCount: res.data.likeCount, localIsLiked: res.data.isLiked };
            }
            return post;
          });
          sessionStorage.setItem("home_posts", JSON.stringify(updatedPosts));
          return updatedPosts;
        });
      }
    } catch (error) {
      console.error("Like error", error);
    }
  }, [currentUserId]);

  const handleShare = useCallback(async (postId) => {
    try {
      const res = await axios.post("/api/post/share", { postId });
      if (res.status === 200) {
        setPosts((prev) => {
          const updatedPosts = prev.map(post => {
            if (post._id === postId) {
              return { ...post, localSharesCount: res.data.sharesCount };
            }
            return post;
          });
          sessionStorage.setItem("home_posts", JSON.stringify(updatedPosts));
          return updatedPosts;
        });
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  }, []);

  const handleOpenComments = useCallback((post) => {
    setActivePostForComments(post);
  }, []);

  const handlePostComment = useCallback(async (e) => {
    e.preventDefault();
    if (!currentUserId || !commentInput.trim() || !activePostForComments) return;

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
        
        setPosts((prevPosts) => {
          const updatedPosts = prevPosts.map((p) => {
            if (p._id === activePostForComments._id) {
              const currentComments = p.comment || [];
              return {
                ...p,
                comment: [...currentComments, newComment]
              };
            }
            return p;
          });
          sessionStorage.setItem("home_posts", JSON.stringify(updatedPosts));
          return updatedPosts;
        });

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
  }, [currentUserId, commentInput, activePostForComments]);


  useEffect(()=>{
    const handleScroll = ()=>{
      const scrollTop = window.scrollY;
      const windowHeigth = window.innerHeight
      const fullHeignt = document.documentElement.scrollHeight
      const scrollePercent = ((scrollTop + windowHeigth)/fullHeignt) * 100;

      if(scrollePercent >= 75 && !loading && hashMore){
        setPage((prev)=> prev + 1)
      }

    }
    window.addEventListener("scroll",handleScroll)
    return ()=>{
      window.removeEventListener("scroll",handleScroll)
    }
  },[loading, hashMore])
  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-2xl border-x border-zinc-800">

        {loading && (
          <p className="text-center py-10 text-zinc-400">
            Loading posts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-center py-10 text-zinc-500">
            No posts found
          </p>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onOpenComments={handleOpenComments}
            onShare={handleShare}
          />
        ))}

      </div>

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
    </main>
  );
};

export default Page;  