import { NextResponse } from "next/server";
import { getAuthUser } from "@/app/lib/auth";
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";

export async function GET(req) {
  try {
    const decoded = getAuthUser(req);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await Connect();
    const user = await userModel.findById(decoded.id).select("_id username email image bio");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { authenticated: true, user: { id: user._id, username: user.username, email: user.email, image: user.image, bio: user.bio } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
