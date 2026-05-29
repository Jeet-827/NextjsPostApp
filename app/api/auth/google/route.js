import { NextResponse } from "next/server"
import { Connect } from "@/app/lib/Mongodb-config"
import { userModel } from "@/app/Model/userSchema"
import jwt from "jsonwebtoken"
import { rateLimit } from "@/app/lib/rateLimit"

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_12345'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_12345'

export async function POST(req) {

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
        const limitRes = rateLimit(ip, 5, 60 * 1000); // 5 requests per minute
        if (!limitRes.success) {
            return NextResponse.json(
                { error: "Too many authentication requests. Please try again in 1 minute." },
                { 
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((limitRes.reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const { email, name, image } = await req.json()

        if (!email) {
            return NextResponse.json(
                { message: "Email required" },
                { status: 400 }
            )
        }

        await Connect()

        let user = await userModel.findOne({
            email: email.toLowerCase()
        })

        if (!user) {

            const username =
                name?.replace(/\s/g, "").toLowerCase() ||
                email.split("@")[0]

            user = await userModel.create({
                username,
                email: email.toLowerCase(),
                image
            })
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            ACCESS_SECRET,
            {
                expiresIn: "15m"
            }
        )

        const refreshToken = jwt.sign(
            {
                id: user._id
            },
            REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        )

        const response = NextResponse.json(
            {
                message: "Google Login Success",
                accessToken,
                user
            },
            {
                status: 200
            }
        )

        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60
        })

        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60
        })

        return response

    } catch (error) {

        console.log(error)

        return NextResponse.json(
            {
                message: "Server Error"
            },
            {
                status: 500
            }
        )
    }
}