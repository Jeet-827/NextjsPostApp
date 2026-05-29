import { PostModel } from "@/app/Model/postSchema";
import { getAuthUser } from "@/app/lib/auth";
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";
import { commentModel } from "@/app/Model/commite.Schema";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await Connect();

    const decode = getAuthUser(req);

    if (!decode) {
      return NextResponse.json(
        { message: "Token Missing or Expired" },
        { status: 401 }
      );
    }

    const user = await userModel.findById(decode.id);

    if (!user) {
      return NextResponse.json(
        { message: "User Not Found" },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Fetch the 300 most recent posts to score and rank
    const recentPosts = await PostModel.find()
      .sort({ createdAt: -1 })
      .limit(300);

    const followingIds = new Set((user.following || []).map(id => id.toString()));
    const userIdStr = decode.id.toString();

    // Score posts based on recommendation parameters
    const scoredPosts = recentPosts.map(post => {
      const authorId = post.userId ? post.userId.toString() : "";
      const isFollowing = followingIds.has(authorId);
      const likesCount = post.like ? post.like.length : 0;
      const commentsCount = post.comment ? post.comment.length : 0;
      const viewsCount = post.views ? post.views.length : 0;

      // Scoring formula: (isFollowing * 100) + (likesCount * 10) + (commentsCount * 15) + (viewsCount * 2)
      // factor in recency decay: up to 50 points boost for new posts in the last 48 hours
      const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const recencyBoost = Math.max(0, 50 - ageInHours);

      const score = (isFollowing ? 100 : 0) + (likesCount * 10) + (commentsCount * 15) + (viewsCount * 2) + recencyBoost;
      return { post, score };
    });

    // Sort in-memory by computed score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    // Paginate in-memory
    const paginatedScoredPosts = scoredPosts.slice(skip, skip + limit);
    const paginatedPostIds = paginatedScoredPosts.map(sp => sp.post._id);

    // Populate only the sliced posts for peak performance
    const populatedPosts = await PostModel.find({ _id: { $in: paginatedPostIds } })
      .populate("userId", "username email image bio")
      .populate({
        path: "comment",
        populate: {
          path: "userId",
          select: "username email image",
        },
      });

    // Re-establish original sorted order
    const orderedPosts = paginatedPostIds.map(id => {
      const p = populatedPosts.find(p => p._id.toString() === id.toString());
      return p ? p.toObject() : null;
    }).filter(Boolean);

    // Asynchronously register views for returned posts
    const postsToUpdateViews = orderedPosts.filter(p => !p.views || !p.views.some(v => v.toString() === userIdStr));
    if (postsToUpdateViews.length > 0) {
      const postIdsToUpdate = postsToUpdateViews.map(p => p._id);
      await PostModel.updateMany(
        { _id: { $in: postIdsToUpdate } },
        { $addToSet: { views: decode.id } }
      );
      
      // Update local views count for immediate UI display
      orderedPosts.forEach(p => {
        if (postIdsToUpdate.some(id => id.toString() === p._id.toString())) {
          if (!p.views) p.views = [];
          p.views.push(decode.id);
        }
      });
    }

    return NextResponse.json(
      {
        message: "Posts fetched",
        posts: orderedPosts,
      },
      { status: 200 }
    );

  } catch (error) {
    console.log("GETPOST ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
      },
      { status: 500 }
    );
  }
};