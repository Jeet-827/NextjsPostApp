import { NotificationModel } from "@/app/Model/notificationSchema";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";
import { PostModel } from "@/app/Model/postSchema";
import { NextResponse } from "next/server";

export const GET = async (req) => {
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

        // Fetch user's notifications, fully populated
        const notifications = await NotificationModel.find({ receiver: decode.id })
            .populate("sender", "username image bio")
            .populate("postId", "title images")
            .sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Success', notifications }, { status: 200 });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
};

export const PUT = async (req) => {
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

        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            // body is empty (e.g. mark all read)
        }

        const { notificationId } = body;

        if (notificationId) {
            // Mark a single notification as read
            await NotificationModel.updateOne(
                { _id: notificationId, receiver: decode.id },
                { isRead: true }
            );
        } else {
            // Mark all notifications for the user as read
            await NotificationModel.updateMany(
                { receiver: decode.id, isRead: false },
                { isRead: true }
            );
        }

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        console.error("Update notifications error:", error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
};
