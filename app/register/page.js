"use client"

import React, { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/features/authSlice'
const Register = () => {

    const router = useRouter()
    const { data: session, status } = useSession()

    const [isLogin, setIsLogin] = useState(false)

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [checkingSession, setCheckingSession] = useState(true)
    const dispatch = useDispatch()

  useEffect(() => {
    const checkUser = async () => {
      try {
        await axios.get("/api/auth/refresh");
        const res = await axios.get("/api/auth/me");
        dispatch(setUser(res.data.user));
        router.push("/home");
      } catch (error) {
        console.log("User not logged in");
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [dispatch, router]);

  useEffect(() => {
    const googleLogin = async () => {
      if (session?.user) {
        try {
          const res = await axios.post("/api/auth/google", {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          });
          dispatch(setUser(res.data.user));
          router.push("/home");
        } catch (error) {
          console.error("Google login failed:", error);
        }
      }
    };
    googleLogin();
  }, [session, dispatch, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("/api/auth/login", {
          email,
          password,
        });
        dispatch(setUser(res.data.user));
        router.push("/home");
      } else {
        await axios.post("/api/auth/signup", {
          username,
          email,
          password,
        });
        const login = await axios.post("/api/auth/login", {
          email,
          password,
        });
        dispatch(setUser(login.data.user));
        router.push("/home");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.response?.data?.error || "Authentication failed");
    }
  };

  if (status === "loading" || checkingSession || session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-lg animate-pulse mb-6">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 7C9 5 15 5 17 7"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M17 17C15 19 9 19 7 17"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M5 10C5 8 7 7 9 8L15 12C17 13 17 15 15 16C13 17 11 17 9 16"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-zinc-500 text-sm animate-pulse">Initializing session...</p>
      </div>
    );
  }
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4">

    <div className="w-full max-w-md bg-gray-900 border border-gray-700 p-8 rounded-3xl shadow-2xl">

      <h1 className="text-4xl font-bold text-center text-white mb-8">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-xl outline-none focus:border-blue-500"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-xl outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 p-3 rounded-xl outline-none focus:border-blue-500"
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-xl font-semibold cursor-pointer"
        >
          {isLogin ? "Login" : "Signup"}
        </button>

      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-500 whitespace-nowrap">or continue with</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={() => signIn("google")}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black py-3 rounded-xl font-semibold transition cursor-pointer mb-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center mt-6 text-gray-400">

        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"
        }

        <span
          onClick={() => setIsLogin(!isLogin)}
          className="ml-2 text-blue-400 font-semibold cursor-pointer hover:text-blue-300"
        >
          {isLogin ? "Signup" : "Login"}
        </span>

      </p>

    </div>

  </div>
)
}

export default Register