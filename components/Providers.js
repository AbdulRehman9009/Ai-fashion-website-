"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import { CartProvider } from "@/contexts/CartContext";
import PaddleLoader from "@/components/providers/PaddleLoader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <CartProvider>
                    <PaddleLoader />
                    {children}
                    <ToastContainer position="bottom-right" theme="dark" />
                </CartProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
