import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // Delete cookies by setting expiration in the past
  response.cookies.set("accessToken", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  // Explicitly delete as well
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}
