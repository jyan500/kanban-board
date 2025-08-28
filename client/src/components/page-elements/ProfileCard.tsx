import React, {useState} from "react"
import { useAppSelector } from "../../hooks/redux-hooks"
import { EditImageIndicator } from "./EditImageIndicator"
import { UploadImageForm } from "../UploadImageForm"

interface Props {
	entityId: number
	imageUrl?: string
	initials?: string
	imageUploadUrl: string
	invalidatesTags: Array<string>
	children?: React.ReactNode
	isOrg?: boolean
	showUploadImage?: boolean
	onUploadSuccess?: () => void
}

export const ProfileCard = ({entityId, imageUrl, imageUploadUrl, invalidatesTags, children, isOrg, initials, showUploadImage=false, onUploadSuccess}: Props) => {

	const [uploadImage, setUploadImage] = useState(showUploadImage)
	return (
		<div className = "tw-w-full tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-flex tw-flex-row tw-justify-center">
				<EditImageIndicator isOrg={isOrg} setUploadImage={setUploadImage} uploadImage={uploadImage} initials={initials} imageUrl={imageUrl ?? ""}/>
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					uploadImage ? <UploadImageForm id={entityId} imageUrl={imageUrl} endpoint={imageUploadUrl} invalidatesTags={invalidatesTags} onUploadSuccess={onUploadSuccess}/> : null
				}
			</div>
			{children}
		</div>
	)
}
