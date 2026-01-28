"use client";
import Script from "next/script";

export default function PaddleLoader() {
    return (
        <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            onLoad={() => {
                if (typeof window !== 'undefined' && window.Paddle) {
                    if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
                        window.Paddle.Initialize({
                            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
                            environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
                        });
                        console.log("Paddle initialized");
                    } else {
                        console.warn("Paddle Client Token not found");
                    }
                }
            }}
        />
    );
}
