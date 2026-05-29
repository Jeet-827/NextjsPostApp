import { userModel } from "@/app/Model/userSchema";
import { NotificationModel } from "@/app/Model/notificationSchema";
import { PostModel } from "@/app/Model/postSchema";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
        const limitRes = rateLimit(ip, 60, 60 * 1000); // 60 requests per minute
        if (!limitRes.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again in 1 minute." },
                { 
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((limitRes.reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const decode = getAuthUser(req);
        if (!decode) {
            return NextResponse.json({ message: 'Token not found or expired' }, { status: 401 });
        }
        const user = await userModel.findById(decode.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const { postId } = await req.json();
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        let isLiked = false;
        if (post.like.includes(user._id)) {
            post.like = post.like.filter(id => id.toString() !== user._id.toString());
            isLiked = false;
        } else {
            post.like.push(user._id);
            isLiked = true;
        }
        
        await post.save();

        if (isLiked && post.userId.toString() !== user._id.toString()) {
            await NotificationModel.create({
                sender: user._id,
                receiver: post.userId,
                type: "like",
                postId: post._id
            });
        }
        
        return NextResponse.json({ message: 'Success', likeCount: post.like.length, isLiked }, { status: 200 });
    } catch (error) {
        console.error("Like error:", error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
};