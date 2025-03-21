import React from "react"
import { BaseIcon } from "./BaseIcon"
import { MdEmail } from "react-icons/md";

interface Props {
	color?: string
	className?: string
}

export const IconEmail = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MdEmail/>
		</BaseIcon>
	)
}
