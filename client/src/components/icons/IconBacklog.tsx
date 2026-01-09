import React from "react"
import { BaseIcon } from "./BaseIcon"
import { PiListFill } from "react-icons/pi";

interface Props {
	color?: string
	className?: string
}

export const IconBacklog = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<PiListFill/>
		</BaseIcon>
	)
}
