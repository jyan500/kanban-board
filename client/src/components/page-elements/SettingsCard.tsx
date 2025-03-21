import React from "react"
import { IconGear } from "../icons/IconGear"
import { Link, useLocation} from "react-router-dom"

interface Props {
	title: string
	links: Array<{link: string, text: string}>
}

export const SettingsCard = ({title, links}: Props) => {
	const { pathname } = useLocation()
	return (
		<div className = "tw-w-full tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
				<IconGear className = "tw-w-4 tw-h-4"/>
				<p className = "tw-font-semibold">{title}</p>
			</div>
			<div className="tw-flex tw-flex-col tw-gap-y-2">
			{
				links.map((link) => (
					<Link className = {`${pathname === link.link ? "tw-bg-light-primary tw-text-primary tw-font-semibold" : "hover:tw-bg-light-primary hover:tw-text-primary tw-font-medium tw-text-gray-700 "} tw-p-1 `} to = {link.link}>{link.text}</Link>
				))
			}
			</div>	
		</div>
	)	
}