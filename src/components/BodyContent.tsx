'use client';

import {HeroUIProvider} from '@heroui/react';
import {ReactNode} from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {ToastContainer} from "react-toastify";
import {authStore} from "@/stores/AuthStore";
import {UserApis} from "@/utils/apis";

interface BodyProps {
    children: ReactNode;
}

export default function BodyContent({children}: BodyProps) {

    if (authStore.isLoggedIn && !authStore.user) {
        UserApis.getUserDetails().then(user => {
            authStore.setUser(user);
        })
    }

    return (
        <HeroUIProvider locale={'zh-CN'}>
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
        </HeroUIProvider>
    );
}