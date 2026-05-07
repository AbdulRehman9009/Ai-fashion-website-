"use client";
import Script from "next/script";

export default function PaddleLoader() {
    return (
        <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            onLoad={() => {
                if (typeof window !== 'undefined' && window.Paddle) {
                    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
                        const initConfig = {
                            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
                        };

                        try {
                            if (typeof window.Paddle.Initialize === 'function') {
                                window.Paddle.Initialize(initConfig);
                            } else if (typeof window.Paddle.Setup === 'function') {
                                window.Paddle.Setup(initConfig);
                            }

                            console.log("Paddle initialized", process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "production");
                        } catch (err) {
                            console.warn("Paddle init error:", err?.message || err);
                        }
                    } else {
                        console.warn("Paddle Client Token not found");
                    }
                }
            }}
        />
    );
}
