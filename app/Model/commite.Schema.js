import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },

    comments: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const commentModel =
  mongoose.models.comment ||
  mongoose.model("comment", commentSchema);