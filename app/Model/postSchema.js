// app/Model/postSchema.js

import mongoose from "mongoose"

const postSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    images: [
        {
            type: String
        }
    ]

}, {
    timestamps: true
})

export const PostModel =
    mongoose.models.posts ||
    mongoose.model("posts", postSchema)