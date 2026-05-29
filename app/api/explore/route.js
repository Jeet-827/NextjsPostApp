import { userModel } from "@/app/Model/userSchema";
import { Connect } from "@/app/lib/Mongodb-config";
import { getAuthUser } from "@/app/lib/auth";
import { rateLimit } from "@/app/lib/rateLimit";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitRes = rateLimit(ip, 60, 60 * 1000); // 60 requests per minute
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many search requests. Please try again in 1 minute." },
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

    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { message: "Search query is required", users: [] },
        { status: 200 }
      );
    }

    // Case-insensitive regex search on username
    const users = await userModel
      .find({
        _id: { $ne: decode.id },
        username: { $regex: query.trim(), $options: "i" },
      })
      .select("_id username email image bio follower")
      .limit(20);

    return NextResponse.json(
      {
        message: "Users fetched",
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Explore search error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
};
