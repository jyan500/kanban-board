import { FiPlus as PlusIcon } from "react-icons/fi";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconPlus = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<PlusIcon/>
		</BaseIcon>
	)
}

