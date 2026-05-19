"use client"
import { SessionProvider } from "next-auth/react"

export const SesstionCover = ({ children }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}