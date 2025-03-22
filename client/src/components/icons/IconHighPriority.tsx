import { HiChevronDoubleUp as HighPriorityIcon } from "react-icons/hi2";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconHighPriority = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<HighPriorityIcon/>
		</BaseIcon>
	)
}

