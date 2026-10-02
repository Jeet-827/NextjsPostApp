import mongoose from "mongoose";

export const Connect = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return mongoose.connection;
        }
        const uri = process.env.MONGODB_URI;
        const conn = await mongoose.connect(uri);
        console.log("DB is connected")
        return conn;
    } catch (error) {
        console.error("MongoDB Connection Error:", error)
        throw error;
    }
}