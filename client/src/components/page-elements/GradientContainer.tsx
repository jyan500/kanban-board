import React from "react"

interface Props {
	className?: string
	children?: React.ReactNode
}

export const GradientContainer = ({className, children}: Props) => {
	return (
		<div className = {`${className} tw-bg-gradient-dark`}>
			{children}	
		</div>
	)
}
