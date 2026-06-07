// app/Model/userSchema.js

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
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
    ],
    bio:{
        type:String,
        maxlength: 500,
    },
    follower:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }],
    following:[{
          type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }]

}, {
    timestamps: true
})

export const userModel =
    mongoose.models.users ||
    mongoose.model("users", userSchema)