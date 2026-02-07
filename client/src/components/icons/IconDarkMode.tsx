import { MdDarkMode } from "react-icons/md"
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconDarkMode = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
            <MdDarkMode/>
		</BaseIcon>
	)
}
