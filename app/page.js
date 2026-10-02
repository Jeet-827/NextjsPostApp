import { redirect } from "next/navigation";

export const metadata = {
  title: "NextPost - Share Your Moments",
};

export default function RootPage() {
  redirect("/home");
}