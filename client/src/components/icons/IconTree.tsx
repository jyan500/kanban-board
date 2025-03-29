import React from "react"
import { ImTree } from "react-icons/im";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconTree = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<ImTree/>
		</BaseIcon>
	)
}
