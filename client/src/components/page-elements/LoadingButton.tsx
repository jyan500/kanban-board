import React from "react"
import { LoadingSpinner } from "../LoadingSpinner"

interface LoadingButtonProps {
	isLoading: boolean
	onClick: () => void
	text: string
}

export const LoadingButton = ({isLoading, text, onClick}: LoadingButtonProps) => {
	return (
		<button disabled={isLoading} onClick={onClick} className = "button">
			<div className = "tw-flex tw-flex-row tw-justify-center tw-gap-x-4">
				<span>{text}</span>
				{isLoading ? (<LoadingSpinner className={"tw-h-6 tw-w-6"}/>) : null}
			</div>
		</button>	
	)
}