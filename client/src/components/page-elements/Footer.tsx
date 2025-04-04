import React from "react"
import { SocialMedia } from "./SocialMedia"
import { GradientContainer } from "./GradientContainer"

export const Footer = () => {
	return (
		<GradientContainer className = "tw-h-[12vh] tw-w-full tw-p-8 tw-flex tw-justify-center tw-items-center tw-bg-primary">
			<SocialMedia/>
		</GradientContainer>
	)		
}
