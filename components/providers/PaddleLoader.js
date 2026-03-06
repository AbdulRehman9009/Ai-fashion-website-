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

                        // Set environment based on env variable
                        // Sandbox tokens start with "test_", live tokens start with "live_"
                        if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox') {
                            initConfig.environment = 'sandbox';
                        }

                        window.Paddle.Initialize(initConfig);
                        console.log(
                            "Paddle initialized in",
                            process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "production",
                            "mode"
                        );
                    } else {
                        console.warn("Paddle Client Token not found");
                    }
                }
            }}
        />
    );
}
