import React from "react"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    theme?: string 
    children: React.ReactNode
}

export const Button = ({theme="secondary", children, ...props}: Props) => {
    const themes = {
        "secondary": "tw-border-gray-300 tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50",
        "primary": "tw-border-primary tw-text-gray-50 tw-bg-primary hover:tw-bg-blue-700",
        "active": "tw-bg-blue-100 tw-text-blue-700"
    }
    return (
        <button className = {`${themes[theme as keyof typeof themes]} tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200`}
        {...props}
        >
            {children}
        </button>
    )
}
