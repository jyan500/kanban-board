import { FiShare2 as ShareIcon } from "react-icons/fi";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconShare = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<ShareIcon/>
		</BaseIcon>
	)
}

