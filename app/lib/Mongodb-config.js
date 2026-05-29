import mongoose from "mongoose";

export const Connect = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return mongoose.connection;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log("DB is connected")
        return conn;
    } catch (error) {
        console.error("MongoDB Connection Error:", error)
        throw error;
    }
}