import React from "react"
import { BaseIcon } from "./BaseIcon"
import { LuTableProperties } from "react-icons/lu";

interface Props {
	color?: string
	className?: string
}

export const IconTable = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<LuTableProperties/>
		</BaseIcon>
	)
}
