import { userModel } from "@/app/Model/userSchema";
import { NotificationModel } from "@/app/Model/notificationSchema";
import { Connect } from "@/app/lib/Mongodb-config";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitRes = rateLimit(ip, 60, 60 * 1000); // 60 requests per minute
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many follow requests. Please try again in 1 minute." },
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
      return NextResponse.json(
        { message: "Token not found or expired" },
        { status: 401 }
      );
    }

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (decode.id === targetUserId) {
      return NextResponse.json(
        { message: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const currentUser = await userModel.findById(decode.id);
    const targetUser = await userModel.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.follower = targetUser.follower.filter(
        (id) => id.toString() !== decode.id
      );
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.follower.push(decode.id);
    }

    await currentUser.save();
    await targetUser.save();

    if (!isFollowing) {
      await NotificationModel.create({
        sender: decode.id,
        receiver: targetUserId,
        type: "follow",
      });
    }

    return NextResponse.json(
      {
        message: isFollowing ? "Unfollowed" : "Followed",
        isFollowing: !isFollowing,
        followerCount: targetUser.follower.length,
        followingCount: currentUser.following.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
};
