import { MdOutlineMarkUnreadChatAlt } from "react-icons/md";
import React from "react"
import { BaseIcon } from "./BaseIcon"

interface Props {
	color?: string
	className?: string
}

export const IconComment = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<MdOutlineMarkUnreadChatAlt/>
		</BaseIcon>
	)
}

