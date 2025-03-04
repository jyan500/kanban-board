import React from "react"
import { BaseIcon } from "./BaseIcon"
import { FaGithub } from "react-icons/fa";

interface Props {
	color?: string
	className?: string
}

export const IconGithub = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaGithub/>
		</BaseIcon>
	)
}
