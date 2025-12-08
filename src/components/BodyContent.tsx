'use client';

import {HeroUIProvider} from '@heroui/react';
import {ReactNode} from 'react';
import Navbar from "@/components/Navbar";
import {ToastContainer} from "react-toastify";
import Modal from "react-modal";

interface BodyProps {
    children: ReactNode;
}

export default function BodyContent({children}: BodyProps) {
    Modal.setAppElement('#app');
    return (
        <HeroUIProvider locale={'zh-CN'}>
            <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}} id={'app'}>
                <Navbar/>
                <main style={{flex: 1}} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    {children}
                </main>
                {/*<Footer/>*/}
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
        </HeroUIProvider>
    );
}