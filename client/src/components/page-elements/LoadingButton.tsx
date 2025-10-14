import React from "react"
import { LoadingSpinner } from "../LoadingSpinner"
import { Button } from "./Button"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
	isLoading?: boolean
	text?: string
	className?: string
	theme?: string
	children?: React.ReactNode
}

export const LoadingButton = ({disabled, className, isLoading=false, theme="primary", text, children, ...props}: LoadingButtonProps) => {
	return (
		<Button theme={theme} disabled={isLoading || disabled} {...props}>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-2">
				{isLoading ? (<LoadingSpinner className={"tw-h-6 tw-w-6"}/>) : null}
				<span>{text}</span>
				{children}
			</div>
		</Button>	
	)
}