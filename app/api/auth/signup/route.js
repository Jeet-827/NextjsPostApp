import { NextResponse } from "next/server";
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/app/lib/rateLimit";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const limitRes = rateLimit(ip, 5, 60 * 1000); // 5 requests per minute
    if (!limitRes.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in 1 minute." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitRes.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET;

    const REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET;

    const { username, email, password } =
      await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields required",
        },
        {
          status: 400,
        }
      );
    }

    await Connect();

    const existingUser = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newUser = await userModel.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
      ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json(
      {
        message: "Signup successful",

        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          image: newUser.image,
        },
        accessToken
      },
      {
        status: 200,
      }
    );

    const cookieStore = await cookies();

    cookieStore.set(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      }
    );

    cookieStore.set(
      "accessToken",
      accessToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    return response;

  } catch (error) {

    console.error("Signup error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}