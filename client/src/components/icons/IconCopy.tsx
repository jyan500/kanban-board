import { FaRegCopy } from "react-icons/fa";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconCopy = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaRegCopy/>
		</BaseIcon>
	)
}
