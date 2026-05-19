import mongoose from "mongoose";

export const Connect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if (!conn) {
            console.log("Db not connected")
        }
        console.log("DB is connected")
    } catch (error) {
        console.log(error)

    }


}