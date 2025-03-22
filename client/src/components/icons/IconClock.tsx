import { LuClock as ClockIcon } from "react-icons/lu";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconClock = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<ClockIcon/>
		</BaseIcon>
	)
}

