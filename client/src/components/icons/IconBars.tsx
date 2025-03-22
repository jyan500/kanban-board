import React from "react"
import { BsFillFileBarGraphFill as BarsIcon } from "react-icons/bs";
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconBars = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<BarsIcon/>
		</BaseIcon>
	)
}
