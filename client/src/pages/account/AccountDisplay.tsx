import React, { useState, useEffect } from "react"
import { Link, Outlet, useParams } from "react-router-dom" 
import { EditImageIndicator } from "../../components/page-elements/EditImageIndicator"
import { useAppSelector } from "../../hooks/redux-hooks"
import { UploadImageForm } from "../../components/UploadImageForm"
import { IconUser } from "../../components/icons/IconUser"
import { IconBuilding } from "../../components/icons/IconBuilding"
import { IconEmail } from "../../components/icons/IconEmail"
import { USER_PROFILE_URL, USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { ACCOUNT_CREATE_ORG, ACCOUNT_CHANGE_PASSWORD, ACCOUNT_JOIN_ORGANIZATION, ACCOUNT_NOTIFICATION_SETTINGS, NOTIFICATIONS } from "../../helpers/routes"
import { displayUser } from "../../helpers/functions"

export const AccountDisplay = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ uploadImage, setUploadImage ] = useState(false)
	return (
		<div className = "tw-w-full">
			<div className = "tw-flex tw-flex-col tw-gap-y-6 lg:tw-flex-row lg:tw-gap-x-6">
				{userProfile ? 
					<>
						<div className = "lg:tw-w-1/4 tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-items-center">
							<EditImageIndicator setUploadImage={setUploadImage} uploadImage={uploadImage} imageUrl={userProfile?.imageUrl ?? ""}/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								{
									uploadImage ? <UploadImageForm id={userProfile.id} imageUrl={userProfile.imageUrl} endpoint={`${USER_PROFILE_URL}/image`} invalidatesTags={["UserProfiles"]}/> : null
								}
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><IconUser className = "tw-mt-1"/></div>
									<div>{displayUser(userProfile)}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><IconEmail className = "tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.email}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><IconBuilding className = "tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.organizationName}</div>	
								</div>
								{/* TODO: redo this section to improve the UI */}
								<div className="tw-grid tw-grid-cols-2 tw-gap-2 tw-mt-4">
									<Link className = "tw-text-center button" to = {ACCOUNT_CHANGE_PASSWORD}>Change Password</Link>
									<Link className = "tw-text-center button" to = {ACCOUNT_NOTIFICATION_SETTINGS}>Notification Settings</Link>
									<Link className = "tw-text-center button" to = {ACCOUNT_CREATE_ORG}>Create Organization</Link>
									<Link className = "tw-text-center button" to = {ACCOUNT_JOIN_ORGANIZATION}>Join Organization</Link>
									<Link className = "tw-text-center button" to = {NOTIFICATIONS}>Notifications</Link>
								</div>
							</div>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full">
							<Outlet/>
						</div>
					</>
				: null
				}
			</div>
		</div>
	)
}
