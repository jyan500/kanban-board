import React from "react"
import { LoadingSpinner } from "../LoadingSpinner"

interface LoadingButtonProps {
	isLoading?: boolean
	disabled?: boolean
	onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	text: string
	type?: "button" | "submit" | "reset" | undefined
	className?: string
}

export const LoadingButton = ({disabled, type, className, isLoading, text, onClick}: LoadingButtonProps) => {
	return (
		<button disabled={isLoading || disabled} type={type ?? "button"} onClick={onClick} className = {`${className ?? "button"}`}>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-2">
				{isLoading ? (<LoadingSpinner className={"tw-h-6 tw-w-6"}/>) : null}
				<span>{text}</span>
			</div>
		</button>	
	)
}