import "./globals.css";
import { SesstionCover } from "./components/Session";
import Provider from "./store/providers/ReduxProvider";
import Sidebar from "./components/Navbar";

export const metadata = {
  title: {
    template: "%s | NextPost",
    default: "NextPost - Share Your Moments",
  },
  description: "A state-of-the-art social media and post-sharing application built with Next.js and React 19.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex bg-black text-white antialiased">
        <Provider>
        <Sidebar/>
        <SesstionCover>
          <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
            {children}
          </main>
        </SesstionCover>
        </Provider>
      </body>
    </html>
  );
}
