import { IoReorderTwoOutline as MediumPriorityIcon } from "react-icons/io5";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconMediumPriority = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MediumPriorityIcon/>
		</BaseIcon>
	)
}


