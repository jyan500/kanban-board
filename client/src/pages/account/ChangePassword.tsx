import React from "react"
import { useAppSelector } from "../../hooks/redux-hooks"
import { EditUserForm } from "../../components/EditUserForm"

export const ChangePassword = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	return (
		<div>
			<h1>Change Password</h1>
			{userProfile ? 
				<EditUserForm isAccountsPage={true} isChangePassword={true} userId={userProfile.id}/>
			: null}
		</div>
	)
}