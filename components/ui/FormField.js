"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle, AlertCircle, Check } from "lucide-react";
import { useState } from "react";

/**
 * Enhanced Form Field Component with tooltips, validation feedback, and better UX
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.type - Input type (text, email, password, number, tel)
 * @param {string} props.value - Field value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helpText - Help text shown below input
 * @param {string} props.tooltip - Tooltip text shown on hover
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {boolean} props.valid - Whether field is valid
 * @param {string} props.prefix - Prefix text/symbol (e.g., "$")
 * @param {string} props.suffix - Suffix text/symbol (e.g., "%")
 * @param {string} props.className - Additional classes
 * @param {Object} props.inputProps - Additional input props
 */
export default function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    helpText,
    tooltip,
    required = false,
    error,
    valid,
    prefix,
    suffix,
    className = "",
    inputProps = {},
}) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;
    const isValid = valid && !hasError && value;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label Row */}
            <div className="flex items-center justify-between">
                <Label
                    htmlFor={name}
                    className={`text-sm font-medium transition-colors ${hasError ? "text-red-600" :
                            isFocused ? "text-blue-600" :
                                "text-gray-700"
                        }`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>

                {/* Tooltip */}
                {tooltip && (
                    <div className="relative">
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            onClick={(e) => {
                                e.preventDefault();
                                setShowTooltip(!showTooltip);
                            }}
                        >
                            <HelpCircle className="h-4 w-4" />
                        </button>

                        {showTooltip && (
                            <div className="absolute right-0 top-6 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                {tooltip}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Container */}
            <div className="relative">
                {/* Prefix */}
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                        {prefix}
                    </span>
                )}

                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        transition-all duration-200
                        ${prefix ? "pl-8" : ""}
                        ${suffix || isValid || hasError ? "pr-10" : ""}
                        ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
                        ${isValid ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : ""}
                        ${isFocused && !hasError && !isValid ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                    `}
                    {...inputProps}
                />

                {/* Suffix or Status Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {suffix && (
                        <span className="text-gray-500 text-sm">{suffix}</span>
                    )}
                    {isValid && !suffix && (
                        <Check className="h-4 w-4 text-green-500" />
                    )}
                    {hasError && !suffix && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                </div>
            </div>

            {/* Help Text or Error Message */}
            {(helpText || error) && (
                <p className={`text-xs ${hasError ? "text-red-600" : "text-gray-500"}`}>
                    {error || helpText}
                </p>
            )}
        </div>
    );
}

/**
 * Form Section Component for grouping related fields
 */
export function FormSection({ title, description, icon: Icon, children, className = "" }) {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    )}
                </div>
            </div>
            <div className="pl-0 md:pl-12 space-y-4">
                {children}
            </div>
        </div>
    );
}

/**
 * Form Progress Indicator
 */
export function FormProgress({ steps, currentStep }) {
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                        ${index < currentStep ? "bg-green-500 text-white" :
                            index === currentStep ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                                "bg-gray-200 text-gray-500"}
                    `}>
                        {index < currentStep ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    <span className={`
                        hidden sm:block ml-2 text-sm font-medium
                        ${index <= currentStep ? "text-gray-900" : "text-gray-400"}
                    `}>
                        {step}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`
                            w-8 sm:w-16 h-0.5 mx-2
                            ${index < currentStep ? "bg-green-500" : "bg-gray-200"}
                        `} />
                    )}
                </div>
            ))}
        </div>
    );
}
