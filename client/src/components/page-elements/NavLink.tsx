import React from "react"
import { Link } from "react-router-dom"
import { FADE_ANIMATION, NAVLINK_HOVER, NAVLINK_TEXT} from "../../helpers/constants"

interface Props {
	isActive?: boolean
	className?: string
	url: string
	text: string
	onClick?: (e: React.MouseEvent) => void
	icon?: React.ReactElement
}

export const NavLink = ({isActive, onClick, className, url, icon, text}: Props) => {
	return (
		<Link onClick={onClick} className = {`tw-flex tw-flex-row tw-items-center tw-gap-x-2 ${isActive ? `${NAVLINK_TEXT} tw-font-semibold` : `${NAVLINK_HOVER} tw-font-medium dark:tw-text-white tw-text-gray-700`} ${className ?? "tw-p-1.5"} ${FADE_ANIMATION}`} to={url}>
			{icon}
			{text}
		</Link>
	)
}
