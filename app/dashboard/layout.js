import { MySideBar } from "@/components/MySideBar";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  return (
      <div className={"flex min-h-screen antialiased"}>
        <div className="w-fit">
          <MySideBar />
        </div>
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
  );
}
