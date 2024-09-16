import React from "react"
import { IconContext } from "react-icons"
import { IconButton } from "./IconButton"
import { GrPrevious as Previous, GrNext as Next } from "react-icons/gr";

interface Props {
	onClick: (e: React.MouseEvent) => void	
	text?: string
	isForward?: boolean
}

export const ArrowButton = ({onClick, isForward, text}: Props) => {
	return (
		<IconButton onClick={onClick}>
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
	            <IconContext.Provider value = {{className: `${text ? "tw-w-6 tw-h-6" : "tw-w-4 tw-h-4"}`}}>
	                {isForward ? <Next/> : <Previous/>}
	            </IconContext.Provider> 
	            {text ? (
		            <span className = "tw-font-bold tw-text-lg">{text}</span>
            	) : null}
	        </div>	
		</IconButton>
	)
}
