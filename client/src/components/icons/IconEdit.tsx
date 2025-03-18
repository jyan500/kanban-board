import React from "react"
import { FaRegEdit } from "react-icons/fa";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconEdit = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaRegEdit/>
		</BaseIcon>
	)
}
