import React from "react"

interface Props {
	icon: React.ReactNode
	text: string
}

export const TextIconRow = ({text, icon}: Props) => {
	return (
		<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
			{icon}	
			<span>{text}</span>	
		</div>
	)
}