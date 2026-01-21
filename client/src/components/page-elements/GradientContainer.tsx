import React from "react"
import { GRADIENT } from "../../helpers/constants"

interface Props {
	className?: string
	children?: React.ReactNode
}

export const GradientContainer = ({className, children}: Props) => {
	const updatedGradient = "tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800"
	return (
		<div className = {`${className} ${updatedGradient}`}>
			{children}	
		</div>
	)
}
