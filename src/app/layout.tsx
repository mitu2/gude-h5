import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {APP_NAME} from "@/utils/env";
import BodyContent from "@/components/BodyContent";
import React from "react";

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
        <html data-color-mode="light" lang="zh-CN">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}
        >
        <BodyContent>
            {children}
        </BodyContent>
        </body>
        </html>
    );
}
