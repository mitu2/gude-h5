import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import HeroUIClientProvider from '@/components/HeroUIClientProvider';
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import {ToastContainer} from 'react-toastify';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {APP_NAME} from "@/utils/env";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: APP_NAME,
    description: "基于Next.js和WebSocket的实时聊天应用",
};

export default function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}
        >
        <HeroUIClientProvider>
            <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                <Navbar/>
                <main style={{flex: 1}}>
                    {children}
                </main>
                <Footer/>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </HeroUIClientProvider>
        </body>
        </html>
    );
}
