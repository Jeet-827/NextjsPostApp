import { userModel } from "@/app/Model/userSchema";
import { PostModel } from "@/app/Model/postSchema";
import { commentModel } from "@/app/Model/commite.Schema";
import { Connect } from "@/app/lib/Mongodb-config";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";

export const GET = async (req) => {
  try {
    await Connect();
    
    const decode = getAuthUser(req);

    if (!decode) {
      return NextResponse.json(
        { message: "Token not found, please login" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("id") || decode.id;

    const user = await userModel
      .findById(userId)
      .select("-password")
      .populate("follower", "_id username email image bio")
      .populate("following", "_id username email image bio");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    const posts = await PostModel.find({ userId })
      .populate("userId", "username email image bio")
      .populate({
        path: "comment",
        populate: {
          path: "userId",
          select: "username email image",
        },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Profile fetched successfully",
        user,
        posts,
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
      },
      { status: 500 }
    );
  }
};