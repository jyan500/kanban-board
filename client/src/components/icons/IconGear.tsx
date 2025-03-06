import { FaGear } from "react-icons/fa6";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconGear = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaGear/>
		</BaseIcon>
	)
}
