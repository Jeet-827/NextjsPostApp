import { NextResponse } from "next/server";
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";
import { PostModel } from "@/app/Model/postSchema";
import { commentModel } from "@/app/Model/commite.Schema";
import { NotificationModel } from "@/app/Model/notificationSchema";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitRes = rateLimit(ip, 60, 60 * 1000); // 60 requests per minute
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many comment requests. Please try again in 1 minute." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitRes.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    await Connect();

    const decode = getAuthUser(req);
    if (!decode) {
      return NextResponse.json({ message: "Token not found or expired" }, { status: 401 });
    }

    const user = await userModel.findById(decode.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { postId, comments } = await req.json();
    if (!postId || !comments || !comments.trim()) {
      return NextResponse.json({ message: "Post ID and comment content are required" }, { status: 400 });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = await commentModel.create({
      userId: user._id,
      postId: post._id,
      comments: comments.trim()
    });

    if (!post.comment) {
      post.comment = [];
    }
    post.comment.push(newComment._id);
    await post.save();

    if (post.userId.toString() !== user._id.toString()) {
      await NotificationModel.create({
        sender: user._id,
        receiver: post.userId,
        type: "comment",
        postId: post._id,
      });
    }

    const populatedComment = await commentModel.findById(newComment._id).populate({
      path: "userId",
      select: "username email image"
    });

    return NextResponse.json({
      message: "Comment added successfully",
      comment: populatedComment
    }, { status: 201 });

  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
  }
}
