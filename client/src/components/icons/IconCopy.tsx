import { IoCopyOutline } from "react-icons/io5";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconCopy = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<IoCopyOutline/>
		</BaseIcon>
	)
}
