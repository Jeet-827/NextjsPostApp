import { userModel } from "@/app/Model/userSchema";
import { Connect } from "@/app/lib/Mongodb-config";
import { getAuthUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await Connect();

    const decode = await getAuthUser(req);
    if (!decode) {
      return NextResponse.json(
        { message: "Token not found or expired" },
        { status: 401 }
      );
    }

    const user = await userModel
      .findById(decode.id)
      .populate("following", "_id username email image bio");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Following list fetched",
        following: user.following || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Following list error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
};
