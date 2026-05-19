// app/api/post/route.js

import { NextResponse } from "next/server"
import ImageKit from "imagekit"
import jwt from "jsonwebtoken"

import { Connect } from "@/app/lib/Mongodb-config"
import { PostModel } from "@/app/Model/postSchema"
import { userModel } from "@/app/Model/userSchema"

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT
})

export async function POST(req) {
    try {
        await Connect()

        const token = req.headers
            .get("authorization")
            ?.split(" ")[1]

        if (!token) {
            return NextResponse.json(
                { message: "Token Missing" },
                { status: 401 }
            )
        }

        let decode
        try {
            decode = jwt.verify(token, ACCESS_SECRET)
        } catch (err) {
            return NextResponse.json(
                { message: "Invalid or expired token" },
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
            console.log("Post create rejected (400):", { title, imagesLength: images?.length })
            return NextResponse.json(
                { message: "All fields required" },
                { status: 400 }
            )
        }

        const uploadedImages = []

        for (const image of images) {
            const bytes = await image.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
            })

            uploadedImages.push(response.url)
        }

        const post = await PostModel.create({
            userId: user._id,
            title,
            images: uploadedImages
        })

        if (!user.posts) {
            user.posts = []
        }
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
        console.error("Post Creation API Error:", error)
        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        )
    }
}
