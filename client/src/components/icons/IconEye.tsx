import React from "react"
import { FaEye } from "react-icons/fa"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconEye = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaEye/>
		</BaseIcon>
	)
}
