import React from "react"
import { BaseIcon } from "./BaseIcon"
import { RiTimelineView } from "react-icons/ri";

interface Props {
	color?: string
	className?: string
}

export const IconTimeline = ({color, className}: Props) => {
	return (
		<BaseIcon color={color} className={className}>
			<RiTimelineView/>
		</BaseIcon>
	)
}
