import React, {useState} from "react"
import { useAppSelector } from "../../hooks/redux-hooks"
import { ProfileCard } from "../../components/page-elements/ProfileCard"
import { SettingsCard } from "../../components/page-elements/SettingsCard"
import { Outlet } from "react-router-dom"
import { displayUser } from "../../helpers/functions"
import { AccountDisplay } from "../account/AccountDisplay"
import { IconUser } from "../../components/icons/IconUser"
import { IconEmail } from "../../components/icons/IconEmail"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { TEMP, ACCOUNT, ACCOUNT_REGISTRATION_REQUESTS, ACCOUNT_CREATE_ORG, ACCOUNT_SWITCH_ORGANIZATION, ACCOUNT_CHANGE_PASSWORD, ACCOUNT_JOIN_ORGANIZATION, ACCOUNT_NOTIFICATION_SETTINGS, NOTIFICATIONS } from "../../helpers/routes"
import { Banner } from "../../components/page-elements/Banner"
import { AccountContainer } from "../../components/account/AccountContainer"

export const TempAccount = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ uploadImage, setUploadImage ] = useState(false)
	const links = [
		{
			link: `${TEMP}${ACCOUNT}`,
			text: "Profile"
		},
		{
			link: `${TEMP}${ACCOUNT_CHANGE_PASSWORD}`,
			text: "Change Password"
		},
		{
			link: `${TEMP}${ACCOUNT_CREATE_ORG}`, 
			text: "Create Organization",
		},
		{
			link: `${TEMP}${ACCOUNT_JOIN_ORGANIZATION}`, 	
			text: "Join Organization",
		},
		{
			link: `${TEMP}${ACCOUNT_REGISTRATION_REQUESTS}`,		
			text: "Registration Requests"
		}
	]
	return (
		<AccountContainer isTemp={true} userProfile={userProfile} links={links} uploadImage={uploadImage} setUploadImage={setUploadImage}/>
	)	
}
