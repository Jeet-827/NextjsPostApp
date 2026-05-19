import { NextResponse } from 'next/server';
import { Connect } from '@/app/lib/Mongodb-config';
import { userModel } from '@/app/Model/userSchema';
import bcrypt from 'bcrypt';

export async function POST(request) {

    try {

        const { username, email, password } = await request.json();
        console.log("Signup Request Received:", { username, email });

        if (!username || !email || !password) {

            return NextResponse.json(
                {
                    message: "Email and Password required"
                },
                {
                    status: 400
                }
            );
        }

        await Connect();

        const existingUser = await userModel.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {

            return NextResponse.json(
                {
                    error: 'User already exists'
                },
                {
                    status: 400
                }
            );
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = await userModel.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,

        });


        return NextResponse.json(
            {
                message: 'User created successfully',
                user: newUser
            },
            {
                status: 201
            }
        );

    } catch (error) {

        console.error('Signup error:', error);

        return NextResponse.json(
            {
                error: 'Internal Server Error'
            },
            {
                status: 500
            }
        );
    }
}