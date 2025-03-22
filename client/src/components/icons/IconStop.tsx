import { AiOutlineStop } from "react-icons/ai";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconStop = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<AiOutlineStop/>
		</BaseIcon>
	)
}
