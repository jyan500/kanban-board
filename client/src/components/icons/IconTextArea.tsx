import { BsTextareaResize } from "react-icons/bs";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconTextArea = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<BsTextareaResize/>
		</BaseIcon>
	)
}

