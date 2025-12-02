import React from "react"
import { FiFileText } from "react-icons/fi";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconPaper = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FiFileText/>
		</BaseIcon>
	)
}
