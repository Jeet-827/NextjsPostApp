
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

// Force Mongoose to compile the updated schema with the new views and shares fields
if (mongoose.models.posts) {
    delete mongoose.models.posts;
}

export const PostModel = mongoose.model("posts", postSchema);