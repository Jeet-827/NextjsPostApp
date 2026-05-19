import { NextResponse } from 'next/server';
import { Connect } from '@/app/lib/Mongodb-config';
import { userModel } from '@/app/Model/userSchema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_12345';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        await Connect();

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!user.password) {
            return NextResponse.json(
                { error: "This account uses Google login. Please log in with Google." },
                { status: 400 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

     
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json(
            {
                message: "Login successful",
                accessToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    image: user.image
                }
            },
            { status: 200 }
        );

     
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 
        });

        return response;

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
