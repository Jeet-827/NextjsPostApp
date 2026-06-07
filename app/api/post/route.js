import ImageKit from "imagekit"
import { getAuthUser } from "@/app/lib/auth"
import { rateLimit } from "@/app/lib/rateLimit"

import { userModel } from "@/app/Model/userSchema"
import { PostModel } from "@/app/Model/postSchema"

import { Connect } from "@/app/lib/Mongodb-config"

import { NextResponse } from "next/server"

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT
})

export async function POST(req) {

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
        const limitRes = rateLimit(ip, 60, 60 * 1000); // 60 requests per minute
        if (!limitRes.success) {
            return NextResponse.json(
                { error: "Too many post creation requests. Please try again in 1 minute." },
                { 
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((limitRes.reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        await Connect()

        const decode = getAuthUser(req)

        if (!decode) {
            return NextResponse.json(
                { message: "Token Missing or Expired" },
                { status: 401 }
            )
        }

        const user = await userModel.findById(decode.id)

        if (!user) {
            return NextResponse.json(
                { message: "User Not Found" },
                { status: 404 }
            )
        }

        const formData = await req.formData()

        const title = formData.get("title")

        const images = formData.getAll("images")

        if (!title || images.length === 0) {
            return NextResponse.json(
                { message: "Title or Images Missing" },
                { status: 400 }
            )
        }

        if (title.length > 500) {
            return NextResponse.json(
                { message: "Title must be 500 characters or less" },
                { status: 400 }
            )
        }

        if (images.length > 10) {
            return NextResponse.json(
                { message: "Maximum 10 images allowed per post" },
                { status: 400 }
            )
        }

        // Validate each file is an image and under 10MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        for (const image of images) {
            if (!ALLOWED_TYPES.includes(image.type)) {
                return NextResponse.json(
                    { message: `Invalid file type: ${image.name}. Only JPEG, PNG, GIF, WebP and AVIF images are allowed.` },
                    { status: 400 }
                );
            }
            if (image.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { message: `File too large: ${image.name}. Maximum file size is 10MB.` },
                    { status: 400 }
                );
            }
        }

        const uploadUrls = []

        for (let i = 0; i < images.length; i++) {

            const image = images[i]

            const bytes = await image.arrayBuffer()

            const buffer = Buffer.from(bytes)

            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder:"/post"
            })

            uploadUrls.push(response.url)
        }

        const post = await PostModel.create({
            userId: user._id,
            title,
            images: uploadUrls
        })

        user.posts.push(post._id)

        await user.save()

        return NextResponse.json(
            {
                message: "Post Created",
                post
            },
            { status: 201 }
        )

    } catch (error) {

        console.log(error)

        return NextResponse.json(
            {
                message: "Server Error"
            },
            { status: 500 }
        )
    }
}

export async function GET(req) {
    try {
        await Connect()

        const posts = await PostModel.find()
            .populate("userId", "username email image")
            .sort({ createdAt: -1 })

        return NextResponse.json(
            {
                posts
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Fetch posts failed:", error);
        return NextResponse.json(
            {
                message: "Server Error"
            },
            { status: 500 }
        )
    }
}