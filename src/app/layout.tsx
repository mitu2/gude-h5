import type {Metadata} from "next";
import "./globals.css";
import {APP_NAME} from "@/utils/env";
import BodyContent from "@/components/BodyContent";
import React from "react";


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
            style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}
        >
        <BodyContent>
            {children}
        </BodyContent>
        </body>
        </html>
    );
}
