import React from "react"

type Props = {
	className?: string
}

export const Badge = ({className, children}: React.PropsWithChildren<Props>) => {
	return (
		<div className = {`tw-inline-block tw-p-2 tw-rounded-lg ${className}`}>
			{children}
		</div>
	)
}