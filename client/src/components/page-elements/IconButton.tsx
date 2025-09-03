import React from "react"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string,
	disabled?: boolean
	onClick: (e: React.MouseEvent) => void
}

export const IconButton = ({className, disabled, onClick, children, ...props}: React.PropsWithChildren<Props>) => {
	return (
		<button
			disabled={disabled}
            className={`${className ?? "tw-bg-transparent tw-text-gray-700 tw-cursor-pointer"} ${disabled ? "tw-opacity-20" : "hover:tw-opacity-60 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200"}`}
            onClick={onClick}
            {...props}
        >
        {children}
        </button>

	)
}		
