import React from "react"
import LogoIcon from "../../assets/images/logo.png"

type Props = {
	isAuthLayout: boolean 
	textColor?: string
}

export const Logo = ({isAuthLayout, textColor}: Props) => {
	return (
		isAuthLayout ? (
			<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center tw-text-center tw-to-primary tw-from-50%  tw-rounded-md tw-p-4">
				<img className = "tw-w-32 tw-h-32" src = {LogoIcon}/>
				<span className = "tw-text-white tw-font-mono tw-text-5xl">Kanban</span>
			</div>
		) : (
			// <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-text-center tw-bg-gray-50 tw-from-50% tw-rounded-md tw-p-2">
			// 	<img className = "tw-w-8 tw-h-8" src = {LogoIcon}/>
			// 	<span className =  "tw-font-mono tw-text-2xl">Kanban</span>
			// </div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-text-center">
				<img className = "tw-w-10 tw-h-10" src = {LogoIcon}/>
				<span className =  {`tw-font-mono tw-text-3xl ${textColor ?? "tw-text-white"}`}>Kanban</span>
			</div>
		)
	)	
}
