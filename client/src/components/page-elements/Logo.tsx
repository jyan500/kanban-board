import React from "react"
import LogoIcon from "../../assets/images/logo.png"

type Props = {
	isAuthLayout: boolean 
	textColor?: string
}

export const Logo = ({isAuthLayout, textColor}: Props) => {
	const logo = 	
		<svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="3" width="7" height="7" rx="1"/>
			<rect x="14" y="3" width="7" height="7" rx="1"/>
			<rect x="14" y="14" width="7" height="7" rx="1"/>
			<rect x="3" y="14" width="7" height="7" rx="1"/>
		</svg>
	return (
		isAuthLayout ? (
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center tw-text-center tw-to-primary tw-from-50%  tw-rounded-md tw-p-4">
				{/* <img className = "tw-w-32 tw-h-32" src = {LogoIcon}/>
				<span className = "tw-text-white tw-font-mono tw-text-5xl">Kanban</span> */}
				<div className = "tw-flex tw-items-center tw-gap-2 tw-text-xl tw-font-semibold tw-text-blue-600">
					{logo}
					<span className = "tw-font-mono">Kanban</span>
				</div>
			</div>
		) : (
			// <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-text-center tw-bg-gray-50 tw-from-50% tw-rounded-md tw-p-2">
			// 	<img className = "tw-w-8 tw-h-8" src = {LogoIcon}/>
			// 	<span className =  "tw-font-mono tw-text-2xl">Kanban</span>
			// </div>
			<div className="tw-flex tw-items-center tw-gap-2 tw-text-xl tw-font-semibold tw-text-blue-600">
				{logo}
				<span className = "tw-font-mono">Kanban</span>
			</div>
		)
	)	
}
