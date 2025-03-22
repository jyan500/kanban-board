import React from "react"
import { BaseIcon } from "./BaseIcon"
import { MdOutlineViewKanban as BoardIcon } from "react-icons/md";

interface Props {
	color?: string
	className?: string
}

export const IconBoard = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<BoardIcon/>
		</BaseIcon>
	)
}
