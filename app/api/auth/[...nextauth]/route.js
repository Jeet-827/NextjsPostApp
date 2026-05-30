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
                const findUser = await userModel.findOne({ email: user.email })
                if (!findUser) {
                    await userModel.create({

                        username: user.name,

                        email: user.email,

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