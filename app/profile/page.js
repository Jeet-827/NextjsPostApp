import React, { Suspense } from "react";
import UserProfile from "./UserProfile";

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-zinc-400">Loading profile...</p>
      </div>
    }>
      <UserProfile />
    </Suspense>
  );
}
