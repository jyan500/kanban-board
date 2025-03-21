import React from "react"
import { Link } from "react-router-dom"

interface Props {
	isActive?: boolean
	className?: string
	url: string
	text: string
	onClick?: (e: React.MouseEvent) => void
}

export const NavLink = ({isActive, onClick, className, url, text}: Props) => {
	return (
		<Link onClick={onClick} className = {`${isActive ? "tw-bg-light-primary tw-text-primary tw-font-semibold" : "hover:tw-bg-light-primary hover:tw-text-primary tw-font-medium tw-text-gray-700 "} ${className ?? "tw-p-2"} tw-transition tw-duration-100 tw-ease-in-out`} to={url}>{text}</Link>
	)
}
