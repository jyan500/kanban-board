import React from "react"

type Props = {
	showIndicator: boolean
	className?: string
}

export const Indicator = ({showIndicator, className}: Props) => {
	return (
		<div className = {`${showIndicator ? "tw-visible" : "tw-hidden"} tw-absolute ${className ?? "tw-w-3 tw-h-3 tw-top-0 tw-right-0 tw-bg-red-500"} tw-rounded-full`}></div>
	)	
}
