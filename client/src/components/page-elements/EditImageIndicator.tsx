import React from "react"
import { Avatar } from "./Avatar"
import { IconPencil } from "../icons/IconPencil"

interface Props {
	setUploadImage: (uploadImage: boolean) => void
	uploadImage: boolean
	imageUrl: string
	initials?: string
	isOrg?: boolean
}

export const EditImageIndicator = ({setUploadImage, uploadImage, imageUrl, isOrg, initials=""}: Props) => {
	return (
		<div className = "tw-inline-block tw-rounded-full tw-relative">
			<Avatar userInitials={initials} className = {`${imageUrl !== "" ? "tw-rounded-full" : ""}`} imageUrl={imageUrl} size="l" isOrg={isOrg}/>
			<button onClick={() => setUploadImage(!uploadImage)} className = "hover:tw-opacity-80 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-w-8 tw-h-8 tw-bg-gray-800 tw-absolute tw-right-0 tw-bottom-0"><IconPencil color="white"/></button>
		</div>
	)
}
