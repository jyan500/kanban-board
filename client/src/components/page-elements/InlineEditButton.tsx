import React from "react"
import { IconCheckmark } from "../icons/IconCheckmark"

interface Props {
	onClick: (e: React.MouseEvent) => void 	
	children: React.ReactNode
}

export const InlineEditButton = ({onClick, children}: Props) => {
	return (
		<button 
			className="tw-p-2 tw-bg-gray-100 hover:tw-bg-gray-200 tw-transition-colors tw-duration-150"
			onClick={onClick}
		>
			{children}
		</button>
	)
}
