import React from "react"

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive: boolean
	children: React.ReactNode
}

export const TabButton = React.forwardRef<HTMLButtonElement, TabButtonProps>(({isActive, children, ...props}, ref) => {
	return (
		<button ref={ref} {...props} className = {`tw-p-1.5 tw-rounded-sm tw-font-semibold hover:tw-bg-light-primary hover:tw-text-primary ${isActive ? "tw-text-primary tw-bg-light-primary tw-font-bold" : ""} tw-transition tw-duration-100 tw-ease-in-out`}>{children}</button>
	)
})
