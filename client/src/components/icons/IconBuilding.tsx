import React from "react"
import { BaseIcon } from "./BaseIcon"
import { FaBuilding } from "react-icons/fa6";

interface Props {
	color?: string
	className?: string
}

export const IconBuilding = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaBuilding/>
		</BaseIcon>
	)
}
