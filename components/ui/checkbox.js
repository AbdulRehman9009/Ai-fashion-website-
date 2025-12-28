"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
    <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        ref={ref}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-gray-900 data-[state=checked]:text-gray-50",
            className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
    >
        <div className={cn("flex items-center justify-center text-current", checked ? "opacity-100" : "opacity-0")}>
            <Check className="h-3 w-3" />
        </div>
    </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
