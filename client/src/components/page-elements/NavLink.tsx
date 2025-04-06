import React from "react"
import { Link } from "react-router-dom"
import { FADE_ANIMATION } from "../../helpers/constants"

interface Props {
	isActive?: boolean
	className?: string
	url: string
	text: string
	onClick?: (e: React.MouseEvent) => void
}

export const NavLink = ({isActive, onClick, className, url, text}: Props) => {
	return (
		<Link onClick={onClick} className = {`${isActive ? "tw-bg-light-primary tw-text-primary tw-font-semibold" : "hover:tw-bg-light-primary hover:tw-text-primary tw-font-medium tw-text-gray-700"} ${className ?? "tw-p-1.5"} ${FADE_ANIMATION}`} to={url}>{text}</Link>
	)
}
