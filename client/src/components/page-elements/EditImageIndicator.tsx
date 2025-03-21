import React from "react"
import { Avatar } from "./Avatar"
import { IconEdit } from "../icons/IconEdit"

interface Props {
	setUploadImage: (uploadImage: boolean) => void
	uploadImage: boolean
	imageUrl: string
}

export const EditImageIndicator = ({setUploadImage, uploadImage, imageUrl}: Props) => {
	return (
		<div className = "tw-relative tw-rounded-full">
			<Avatar className = "tw-rounded-full" imageUrl={imageUrl} size="l"/>
			<button onClick={() => setUploadImage(!uploadImage)} className = "hover:tw-opacity-80 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-w-8 tw-h-8 tw-bg-gray-800 tw-absolute tw-right-0 tw-bottom-0"><IconEdit color="white"/></button>
		</div>
	)
}
