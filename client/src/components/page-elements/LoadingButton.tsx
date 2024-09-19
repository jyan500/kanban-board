import React from "react"
import { LoadingSpinner } from "../LoadingSpinner"

interface LoadingButtonProps {
	isLoading?: boolean
	onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	text: string
	className?: string
}

export const LoadingButton = ({className, isLoading, text, onClick}: LoadingButtonProps) => {
	return (
		<button disabled={isLoading} onClick={onClick} className = {`${className ?? "button"}`}>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-gap-x-4">
				<span>{text}</span>
				{isLoading ? (<LoadingSpinner className={"tw-h-6 tw-w-6"}/>) : null}
			</div>
		</button>	
	)
}