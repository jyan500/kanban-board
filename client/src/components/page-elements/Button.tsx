import React from "react"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    theme?: string 
    children: React.ReactNode
    className?: string
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(({theme="secondary", children, className, ...props}, ref) => {
    const themes = {
        "default": "",
        "secondary": "tw-border-gray-300 tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50",
        "primary": "tw-border-primary tw-text-gray-50 tw-bg-primary hover:tw-bg-blue-700",
        "alert": "tw-border-danger tw-text-gray-50 tw-bg-danger hover:tw-bg-red-700",
        "active": "tw-bg-blue-100 tw-text-blue-700",
        "purple": "tw-border-light-purple tw-text-gray-50 tw-bg-light-purple hover:tw-bg-light-purple"
    }
    return (
        <button 
            ref={ref}
            className = {`${themes[theme as keyof typeof themes]} tw-inline-flex tw-justify-center tw-items-center tw-px-3 tw-py-3 tw-border tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-whitespace-nowrap tw-duration-200 ${className}`}
            {...props}
        >
            {children}
        </button>
    )
})
