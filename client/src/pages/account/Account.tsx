import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { EditUserForm } from "../../components/EditUserForm"
import { displayUser } from "../../helpers/functions"
import { CgProfile } from "react-icons/cg"
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaBuilding } from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form"
import { AsyncSelect } from "../../components/AsyncSelect"
import { OptionType, Toast } from "../../types/common"
import { USER_PROFILE_URL, USER_PROFILE_ORG_URL } from "../../helpers/urls"
import { UserNotificationTypeForm } from "../../components/forms/UserNotificationTypeForm"
import { ACCOUNT_CREATE_ORG, NOTIFICATIONS } from "../../helpers/routes"
import { useAddRegistrationRequestMutation } from "../../services/private/organization"
import { UploadImageForm } from "../../components/UploadImageForm" 
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4} from "uuid"
import { EditImageIndicator } from "../../components/page-elements/EditImageIndicator"

export const Account = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)

	return (
		<div>
			<h1>Account</h1>
			{userProfile ? 
				<EditUserForm isAccountsPage={true} isChangePassword={false} userId={userProfile.id}/>
			: null}

		</div>
	)
}
