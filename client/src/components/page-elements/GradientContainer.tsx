import React from "react"

interface Props {
	className?: string
	children?: React.ReactNode
}

export const GradientContainer = ({className, children}: Props) => {
	const originalGradient = "tw-bg-gradient-to-r tw-from-gray-100 tw-to-white"
	const updatedGradient = "tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800"
	return (
		<div className = {`${className} ${originalGradient}`}>
			{children}	
		</div>
	)
}
