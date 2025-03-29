import React from "react"
import { HiOutlineLink as LinkIcon } from "react-icons/hi";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconLink = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<LinkIcon/>
		</BaseIcon>
	)
}
