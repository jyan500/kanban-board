import React from "react"

interface Props {
	width?: string
	height?: string
	className?: string
	children?: React.ReactNode
}

export const LoadingSkeleton = ({width = "tw-w-full", height = "tw-h-4", className, children}: Props) => {
	return (
	<div className={`tw-animate-pulse tw-rounded ${width} ${height} ${className}`}>
		{children}
	</div>
	)
}