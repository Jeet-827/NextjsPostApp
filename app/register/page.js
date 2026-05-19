"use client"

import React, { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const Register = () => {

    const router = useRouter()
    const { data: session } = useSession()

    const [isLogin, setIsLogin] = useState(false)

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("accessToken")

        if (token) {
            router.push("/home")
        }
    }, [])

    useEffect(() => {

        const googleLogin = async () => {

            if (session?.user) {

                const res = await axios.post("/api/auth/google", {
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image
                })

                localStorage.setItem("accessToken", res.data.accessToken)

                router.push("/home")
            }
        }

        googleLogin()

    }, [session])

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (isLogin) {

            const res = await axios.post("/api/auth/login", {
                email,
                password
            })

            localStorage.setItem("accessToken", res.data.accessToken)

            router.push("/home")

        } else {

            await axios.post("/api/auth/signup", {
                username,
                email,
                password
            })

            const login = await axios.post("/api/auth/login", {
                email,
                password
            })

            localStorage.setItem("accessToken", login.data.accessToken)

            router.push("/home")
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>

            <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg'>

                <h1 className='text-3xl font-bold text-center mb-6'>
                    {isLogin ? "Login" : "Signup"}
                </h1>

                <form onSubmit={handleSubmit} className='space-y-4'>

                    {!isLogin && (
                        <input
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full border p-3 rounded-lg'
                        />
                    )}

                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full border p-3 rounded-lg'
                    />

                    <input
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full border p-3 rounded-lg'
                    />

                    <button className='w-full bg-black text-white py-3 rounded-lg'>
                        {isLogin ? "Login" : "Signup"}
                    </button>

                </form>

                <div className='text-center my-4'>OR</div>

                <button
                    onClick={() => signIn("google")}
                    className='w-full border py-3 rounded-lg'
                >
                    Continue with Google
                </button>

                <p className='text-center mt-5 text-sm'>

                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"
                    }

                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        className='ml-1 font-bold cursor-pointer'
                    >
                        {isLogin ? "Signup" : "Login"}
                    </span>

                </p>

            </div>

        </div>
    )
}

export default Register