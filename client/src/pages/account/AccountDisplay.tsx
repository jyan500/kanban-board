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
import { AccountContainer } from "../../components/account/AccountContainer"

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
		<AccountContainer userProfile={userProfile} links={links} uploadImage={uploadImage} setUploadImage={setUploadImage}/>
	)
}
