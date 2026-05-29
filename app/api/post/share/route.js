import { PostModel } from "@/app/Model/postSchema";
import { NotificationModel } from "@/app/Model/notificationSchema";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { Connect } from "@/app/lib/Mongodb-config";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        await Connect();

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

        const { postId } = await req.json();
        if (!postId) {
            return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        post.shares = (post.shares || 0) + 1;
        await post.save();

        if (post.userId.toString() !== decode.id.toString()) {
            await NotificationModel.create({
                sender: decode.id,
                receiver: post.userId,
                type: "share",
                postId: post._id
            });
        }

        return NextResponse.json({ message: 'Success', sharesCount: post.shares }, { status: 200 });
    } catch (error) {
        console.error("Share endpoint error:", error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
};
