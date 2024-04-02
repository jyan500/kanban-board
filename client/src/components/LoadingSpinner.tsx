import React from "react"
import "../styles/loading-spinner.css"

interface Props {
	className?: string
}

export const LoadingSpinner = ({className}: Props) => {
	return (
		<div className = {`spinner ${className ?? ""}`}></div>
	)	
}