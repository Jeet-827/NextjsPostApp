
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
    ],
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }],
    comment:[{
            type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    }],
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }],
    shares: {
        type: Number,
        default: 0
    }
    

}, {
    timestamps: true
})

export const PostModel =
    mongoose.models.posts ||
    mongoose.model("posts", postSchema);