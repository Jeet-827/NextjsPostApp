"use client"

import axios from "axios"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
const Page = () => {

    const router = useRouter()

    const [mounted, setMounted] = useState(false)

    const [title, setTitle] = useState("")

    const [images, setImages] = useState([])

    const [preview, setPreview] = useState([])

    const [loading, setLoading] = useState(false)

    const { user, loading: authLoading } = useSelector((state) => state.auth)

    useEffect(() => {
        setMounted(true)
        if (!authLoading && !user) {
            router.push("/register")
        }
    }, [user, authLoading, router])

    
    if (!mounted) {
        return null
    }

    
    const handleImage = (e) => {

        const files = Array.from(e.target.files)

        setImages((prev) => [...prev, ...files])

        const previewImages = files.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }))

        setPreview((prev) => [...prev, ...previewImages])
    }


    const removeImage = (index) => {

        const updatedImages = [...images]
        const updatedPreview = [...preview]

        updatedImages.splice(index, 1)
        updatedPreview.splice(index, 1)

        setImages(updatedImages)
        setPreview(updatedPreview)
    }

    
    const handleSubmit = async (e) => {

        e.preventDefault()

        if (!title.trim()) {
            alert("Please Enter Title")
            return
        }

        if (images.length === 0) {
            alert("Please Select Images")
            return
        }

        try {

            setLoading(true)

            const formData = new FormData()

            formData.append("title", title)

            for (let i = 0; i < images.length; i++) {

                formData.append("images", images[i])
            }

            const res = await axios.post(
                "/api/post",
                formData
            )

            console.log(res.data)


            setTitle("")
            setImages([])
            setPreview([])

            alert("Post Uploaded Successfully")

        } catch (error) {

            console.error("Post upload failed:", error)
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Unknown server error";

            alert(`Upload Failed: ${errorMsg}`)

        } finally {

            setLoading(false)
        }
    }

    return (

    <>
<div className="flex min-h-screen bg-black text-white">

   

    {/* Main Content */}
    <div className="flex-1 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-6">

        <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-8">

            {/* heading */}
            <div className="text-center mb-10">

                <h1 className="text-4xl font-bold">
                    Upload Post
                </h1>

                <p className="text-zinc-400 mt-2">
                    Upload multiple images with preview
                </p>

            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8"
            >

                {/* title */}
                <div className="space-y-3">

                    <label className="text-lg font-semibold">
                        Post Title
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black border-2 border-zinc-800 rounded-2xl p-4 outline-none focus:border-white transition text-white placeholder:text-zinc-500"
                    />

                </div>

                {/* image input */}
                <div className="space-y-3">

                    <label className="text-lg font-semibold">
                        Upload Images
                    </label>

                    <input
                        type="file"
                        multiple
                        onChange={handleImage}
                        className="w-full border-2 border-dashed border-zinc-700 rounded-2xl p-5 bg-black text-zinc-400 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:rounded-xl file:mr-4"
                    />

                </div>

                {/* image list */}
                {
                    preview.length > 0 && (

                        <div className="space-y-5">

                            <h2 className="text-2xl font-bold">
                                Selected Images
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                                {
                                    preview.map((item, index) => (

                                        <div
                                            key={index}
                                            className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-lg"
                                        >

                                            <img
                                                src={item.url}
                                                alt="preview"
                                                className="w-full h-56 object-cover"
                                            />

                                            <div className="p-4 space-y-3">

                                                <h3 className="font-semibold truncate">
                                                    {item.file.name}
                                                </h3>

                                                <p className="text-sm text-zinc-400">
                                                    {(item.file.size / 1024).toFixed(2)} KB
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="w-full bg-white hover:bg-zinc-300 text-black py-2 rounded-xl transition font-semibold cursor-pointer"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    ))
                                }

                            </div>

                        </div>
                    )
                }

                {/* submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl text-lg font-semibold transition
                        
                        ${loading
                            ? "bg-zinc-700 cursor-not-allowed text-zinc-400"
                            : "bg-white hover:bg-zinc-300 text-black cursor-pointer"
                        }
                    `}
                >

                    {
                        loading
                            ? "Uploading..."
                            : "Upload Post"
                    }

                </button>

            </form>

        </div>

    </div>

</div>
    </>
    )
}

export default Page