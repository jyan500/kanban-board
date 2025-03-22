import React from "react"

interface Props {
	className?: string
	children?: React.ReactNode
}

export const GradientContainer = ({className, children}: Props) => {
	return (
		<div className = {`${className} tw-bg-gradient-to-r tw-from-cyan-500 tw-to-primary`}>
			{children}	
		</div>
	)
}
