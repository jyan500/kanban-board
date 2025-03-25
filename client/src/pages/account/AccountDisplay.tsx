import React, { useState, useEffect } from "react"
import { Link, Outlet, useParams, useLocation } from "react-router-dom" 
import { EditImageIndicator } from "../../components/page-elements/EditImageIndicator"
import { useAppSelector } from "../../hooks/redux-hooks"
import { UploadImageForm } from "../../components/UploadImageForm"
import { IconUser } from "../../components/icons/IconUser"
import { IconBuilding } from "../../components/icons/IconBuilding"
import { IconEmail } from "../../components/icons/IconEmail"
import { IconGear } from "../../components/icons/IconGear"
import { USER_PROFILE_URL, USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { ACCOUNT, ACCOUNT_CREATE_ORG, ACCOUNT_SWITCH_ORGANIZATION, ACCOUNT_CHANGE_PASSWORD, ACCOUNT_JOIN_ORGANIZATION, ACCOUNT_NOTIFICATION_SETTINGS, NOTIFICATIONS } from "../../helpers/routes"
import { displayUser } from "../../helpers/functions"
import { SettingsCard } from "../../components/page-elements/SettingsCard"
import { ProfileCard } from "../../components/page-elements/ProfileCard"
import { AccountActivationBanner } from "../../components/page-elements/AccountActivationBanner"

export const AccountDisplay = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ uploadImage, setUploadImage ] = useState(false)
	const { pathname } = useLocation()
	const links = [
		{
			link: ACCOUNT,
			text: "Profile"
		},
		{
			link: ACCOUNT_CHANGE_PASSWORD,
			text: "Change Password"
		},
		...(userProfile?.isActive ? [ 
			{
				link: ACCOUNT_NOTIFICATION_SETTINGS,	
				text: "Notification Settings",
			},
			{
				link: ACCOUNT_CREATE_ORG, 
				text: "Create Organization",
			},
			{
				link: ACCOUNT_JOIN_ORGANIZATION, 	
				text: "Join Organization",
			},
			{
				link: ACCOUNT_SWITCH_ORGANIZATION,
				text: "Switch Organization"
			},
			{
				link: NOTIFICATIONS,
				text: "Notifications"
			}
		] : []),
	]
	return (
		<div className = "tw-w-full">
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
								 		<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
								 			<div><IconBuilding className = "tw-mt-1"/></div>
								 			<div className = "tw-w-full">{userProfile?.organizationName}</div>	
								 		</div>	
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
