import React from "react"
import { SocialMedia } from "./SocialMedia"
import { GradientContainer } from "./GradientContainer"

export const Footer = () => {
	return (
		// <GradientContainer className = "tw-h-[12vh] tw-w-full tw-p-8 tw-flex tw-justify-center tw-items-center tw-bg-primary">
		// 	<SocialMedia/>
		// </GradientContainer>
		<footer className="tw-bg-gray-50 tw-border-t tw-border-gray-200 tw-py-8 tw-px-6 tw-text-center">
			<SocialMedia/>
		</footer>
	)		
}
