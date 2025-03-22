import { BsThreeDots as MenuIcon } from "react-icons/bs";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconMenu = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MenuIcon/>
		</BaseIcon>
	)
}

