import { GrPowerCycle } from "react-icons/gr";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconCycle = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<GrPowerCycle/>
		</BaseIcon>
	)
}
