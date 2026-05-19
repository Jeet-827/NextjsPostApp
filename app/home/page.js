"use client"

import axios from "axios"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const Page = () => {
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [images, setImages] = useState([])

    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (!token) {
            router.push("/register")
        }
    }, [router])

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (!title.trim()) {
            alert("Please enter a title")
            return
        }

        if (!images || images.length === 0) {
            alert("Please select at least one image")
            return
        }

        const token = localStorage.getItem("accessToken")

        const formData = new FormData()

        formData.append("title", title)

        // multiple images
        for (let i = 0; i < images.length; i++) {

            formData.append("images", images[i])
        }

        const res = await axios.post(
            "/api/post",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        console.log(res.data)
    }

    return (

        <form
            onSubmit={handleSubmit}
            className="p-10 space-y-4"
        >

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-3 w-full"
            />

            <input
                type="file"
                multiple
                onChange={(e) => setImages(e.target.files)}
            />

            <button className="bg-black text-white px-5 py-2">
                Upload
            </button>

        </form>
    )
}

export default Page