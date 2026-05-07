"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "@/contexts/CartContext";
import PaddleLoader from "@/components/providers/PaddleLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";

export function Providers({ children }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <NextTopLoader showSpinner={false} color={"#fff"} height={3} />
                    <CartProvider>
                        <PaddleLoader />
                        {children}
                        <ToastContainer position="bottom-right" theme="dark" />
                    </CartProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
