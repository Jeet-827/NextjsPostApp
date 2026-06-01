import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = async (req) => {
  try {

    const getToken =
      req.cookies.get("refreshToken")?.value;

    if (!getToken) {
      return NextResponse.json(
        {
          message: "Refresh token not found",
        },
        {
          status: 401,
        }
      );
    }

    const decode = jwt.verify(
      getToken,
      process.env.JWT_REFRESH_SECRET
    );

    const accessToken = jwt.sign(
      {
        id: decode.id,
        email: decode.email,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: decode.id,
        email: decode.email,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json(
      {
        message: "Access token generated",
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

    return NextResponse.json(
      {
        error: "Invalid refresh token",
      },
      {
        status: 401,
      }
    );
  }
};