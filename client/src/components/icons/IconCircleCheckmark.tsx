import { CiCircleCheck } from "react-icons/ci";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconCircleCheckmark = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<CiCircleCheck/>
		</BaseIcon>
	)
}

