import React, { useState, useEffect } from "react"
import { Link, Outlet, useParams, useLocation } from "react-router-dom" 
import { UserProfile } from "../../types/common"
import { EditImageIndicator } from "../page-elements/EditImageIndicator"
import { useAppSelector } from "../../hooks/redux-hooks"
import { UploadImageForm } from "../UploadImageForm"
import { IconUser } from "../icons/IconUser"
import { IconBuilding } from "../icons/IconBuilding"
import { IconEmail } from "../icons/IconEmail"
import { IconGear } from "../icons/IconGear"
import { USER_PROFILE_URL, USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { ACCOUNT, ACCOUNT_CREATE_ORG, ACCOUNT_SWITCH_ORGANIZATION, ACCOUNT_CHANGE_PASSWORD, ACCOUNT_JOIN_ORGANIZATION, ACCOUNT_NOTIFICATION_SETTINGS, NOTIFICATIONS } from "../../helpers/routes"
import { displayUser } from "../../helpers/functions"
import { SettingsCard } from "../page-elements/SettingsCard"
import { ProfileCard } from "../page-elements/ProfileCard"
import { Banner } from "../page-elements/Banner"
import { AccountActivationBanner } from "../page-elements/AccountActivationBanner"

interface Props {
	isTemp?: boolean
	userProfile: UserProfile | null | undefined
	links: Array<{link: string, text: string}>
	uploadImage: boolean
	setUploadImage: (isUploadImage: boolean) => void
}

export const AccountContainer = ({userProfile, links, uploadImage, setUploadImage, isTemp}: Props) => {
	return (
		<div className = "tw-w-full tw-space-y-4">
			{isTemp ? <Banner type="warning" message = "Your account has not been approved by the organization. Website features will be limited until the account's approval."/> : null}
			<div className = "tw-flex tw-flex-col tw-gap-y-6 lg:tw-flex-row lg:tw-gap-x-6">
				{userProfile ? 
					<>
						<div className = "lg:tw-w-1/4 tw-flex tw-flex-col tw-gap-y-4">
							{!userProfile.isActive ? <AccountActivationBanner/> : null}
							<>
								<ProfileCard entityId={userProfile.id} imageUploadUrl={`${USER_PROFILE_URL}/image`} invalidatesTags={["UserProfiles"]} imageUrl={userProfile?.imageUrl}>
									<>
										<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
								 			<div><IconUser className = "tw-mt-1"/></div>
								 			<div>{displayUser(userProfile)}</div>	
								 		</div>
								 		<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
								 			<div><IconEmail className = "tw-mt-1"/></div>
								 			<div className = "tw-w-full">{userProfile?.email}</div>	
								 		</div>
								 		{
								 			userProfile?.organizationName ? 
									 		<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									 			<div><IconBuilding className = "tw-mt-1"/></div>
									 			<div className = "tw-w-full">{userProfile?.organizationName}</div>	
									 		</div>: <></>
								 		}
							 		</>
								</ProfileCard>
								<SettingsCard title={"Account Settings"} links={links}/>
							</>
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
