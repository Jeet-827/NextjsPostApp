import { NextResponse } from "next/server"
import { Connect } from "@/app/lib/Mongodb-config"
import { userModel } from "@/app/Model/userSchema"
import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

export async function POST(req) {

    try {

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