import React from "react"
import { BaseIcon } from "./BaseIcon"
import { FaProjectDiagram } from "react-icons/fa";

interface Props {
	color?: string
	className?: string
}

export const IconProject = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<FaProjectDiagram/>
		</BaseIcon>
	)
}
