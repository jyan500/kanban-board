import { RiCheckboxMultipleFill as BulkAction } from "react-icons/ri";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconBulkAction = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<BulkAction/>
		</BaseIcon>
	)
}
