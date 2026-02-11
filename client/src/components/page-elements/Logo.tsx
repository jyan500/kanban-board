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
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center tw-text-center tw-to-primary tw-from-50% tw-rounded-md tw-py-4 tw-pr-4 tw-pl-2">
				<div className = "tw-flex tw-items-center tw-gap-2 tw-text-xl tw-font-semibold tw-text-white">
					<img width={36} height={36} src={LogoIcon}/>
					<span className = "tw-font-mono">Kanban</span>
				</div>
			</div>
		) : (
			<div className="tw-flex tw-items-center tw-gap-3 tw-text-xl tw-font-semibold tw-text-white">
				<img width={36} height={36} src={LogoIcon}/>
				<span className = "tw-font-mono">Kanban</span>
			</div>
		)
	)	
}
