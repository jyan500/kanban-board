import React from "react"
import { IconGear } from "../icons/IconGear"
import { useLocation} from "react-router-dom"
import { NavLink } from "./NavLink"

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
			<div className="tw-flex tw-flex-col tw-gap-y-0.5">
			{
				links.map((link) => (
					<NavLink isActive={pathname === link.link} url={link.link} text={link.text}/>
				))
			}
			</div>	
		</div>
	)	
}
