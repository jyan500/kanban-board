import { HiChevronDown as LowPriorityIcon } from "react-icons/hi2";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconLowPriority = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<LowPriorityIcon/>
		</BaseIcon>
	)
}

