// app/Model/userSchema.js

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String
    },

    image: {
        type: String
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "posts"
        }
    ]

}, {
    timestamps: true
})

export const userModel =
    mongoose.models.users ||
    mongoose.model("users", userSchema)