import React from "react"
import { IconCheckmark } from "../icons/IconCheckmark"
import { LoadingSpinner } from "../LoadingSpinner"

interface Props {
	onClick: (e: React.MouseEvent) => void 	
	children: React.ReactNode
	isLoading?: boolean
	className?: string
}

export const InlineEditButton = ({onClick, isLoading, className, children}: Props) => {
	return (
		<button 
			className={`${!className ? "tw-p-2" : className} tw-bg-gray-100 hover:tw-bg-gray-200 tw-transition-colors tw-duration-150`}
			onClick={onClick}
		>
			{!isLoading ? <>{children}</> : <LoadingSpinner/>}
		</button>
	)
}
