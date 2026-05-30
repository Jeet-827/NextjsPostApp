import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import { Connect } from "@/app/lib/Mongodb-config";
import { userModel } from "@/app/Model/userSchema";
const handle = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user }) {
            try {
                await Connect()
                const findUser = await userModel.findOne({ email: user.email?.toLowerCase() })
                if (!findUser) {
                    const username = user.name?.replace(/\s/g, "").toLowerCase() || user.email?.split("@")[0] || "user";
                    await userModel.create({
                        username,
                        email: user.email?.toLowerCase(),
                        image: user.image
                    })
                    console.log("User Created")
                }

                console.log("userLogin")
                return true
            } catch (error) {
                console.log(error)

                return false

            }

        }


    }
})


export { handle as GET, handle as POST }