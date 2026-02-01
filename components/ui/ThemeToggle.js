"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
            >
                <div className="h-5 w-5" />
            </button>
        );
    }

    const cycleTheme = () => {
        if (theme === "system") {
            setTheme("light");
        } else if (theme === "light") {
            setTheme("dark");
        } else {
            setTheme("system");
        }
    };

    const getIcon = () => {
        if (theme === "system") {
            return <Monitor className="h-5 w-5" />;
        }
        if (resolvedTheme === "dark") {
            return <Moon className="h-5 w-5" />;
        }
        return <Sun className="h-5 w-5" />;
    };

    const getLabel = () => {
        if (theme === "system") return "System theme";
        if (theme === "dark") return "Dark mode";
        return "Light mode";
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            aria-label={getLabel()}
            title={getLabel()}
        >
            {getIcon()}
        </button>
    );
}
