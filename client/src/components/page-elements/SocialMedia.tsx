import React from "react"
import { IconGithub } from "../icons/IconGithub"
import { IconLinkedin } from "../icons/IconLinkedin"

export const SocialMedia = () => {
	return (
		<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-4">
			<a href = "https://www.github.com/jyan500">
				<IconGithub className="tw-w-10 tw-h-10" color="white"/>
			</a>
			<a href = "https://www.linkedin.com/in/jansenyan">
				<IconLinkedin className="tw-w-10 tw-h-10" color="white"/>
			</a>
		</div>
	)	
}