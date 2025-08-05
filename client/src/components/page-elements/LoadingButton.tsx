import React from "react"
import { LoadingSpinner } from "../LoadingSpinner"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
	isLoading?: boolean
	text: string
	className?: string
}

export const LoadingButton = ({disabled, className, isLoading=false, text, ...props}: LoadingButtonProps) => {
	return (
		<button disabled={isLoading || disabled} {...props} className = {`${className ?? "button"}`}>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-2">
				{isLoading ? (<LoadingSpinner className={"tw-h-6 tw-w-6"}/>) : null}
				<span>{text}</span>
			</div>
		</button>	
	)
}