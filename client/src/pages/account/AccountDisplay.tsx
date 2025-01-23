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
import { NOTIFICATIONS } from "../../helpers/routes"
import { useAddRegistrationRequestMutation } from "../../services/private/organization"
import { UploadImageForm } from "../../components/UploadImageForm" 
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4} from "uuid"
import { Avatar } from "../../components/page-elements/Avatar"

type FormValues = {
	organizationId: string | number 
}

export const AccountDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ changePassword, setChangePassword ] = useState(false)
	const [ joinOrganization, setJoinOrganization ] = useState(false)
	const [ uploadImage, setUploadImage ] = useState(false)
	const [ notificationSettings, setNotificationSettings ] = useState(false)

	const defaultForm = {
		organizationId: "" 
	}

	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({defaultValues: preloadedValues})
	const [addRegistrationRequest, {isLoading, error}] = useAddRegistrationRequestMutation()

	const registerOptions = {
		organizationId: {required: "Organization is required"}
	}
	const onSubmit = async (values: FormValues) => {
		const defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: "Registration request entered successfully. You will be notified when your registration request is accepted."
		}
		try {
			await addRegistrationRequest({
				organizationId: !isNaN(Number(values.organizationId)) ? Number(values.organizationId) : 0
			}).unwrap()
			dispatch(addToast(defaultToast))
		}
		catch (e){
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Registration request could not entered."
			}))
		}
	}

	return (
		<div>
			<div className = "tw-flex tw-flex-row tw-gap-x-6">
				{userProfile ? 
					<>
						<div className = "tw-space-y-4 tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-items-center">
							<Avatar imageUrl={userProfile.imageUrl} size="l"/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><FaUser className = "--icon tw-mt-1"/></div>
									<div>{displayUser(userProfile)}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><MdEmail className = "--icon tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.email}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><FaBuilding className = "--icon tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.organizationName}</div>	
								</div>
								<button className = "button" onClick={() => setChangePassword(!changePassword)}>{changePassword ? "Hide Change" : "Change "} Password</button>
								<button className = "button" onClick={() => setJoinOrganization(!joinOrganization)}>{joinOrganization ? "Hide Join" : "Join "} Organization</button>
								<button className = "button" onClick={() => setUploadImage(!uploadImage)}>{uploadImage ? "Hide " : ""}{userProfile.imageUrl ? "Change " : "Upload "}Image</button>
								<button className = "button" onClick={() => setNotificationSettings(!notificationSettings)}>{notificationSettings ? "Hide " : ""} Notification Settings</button>
								{
									uploadImage ? <UploadImageForm id={userProfile.id} imageUrl={userProfile.imageUrl} endpoint={`${USER_PROFILE_URL}/image`} invalidatesTags={["UserProfiles"]}/> : null
								}
								<Link className = "tw-text-center button" to = {NOTIFICATIONS}>Notifications</Link>
							</div>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full">
							<div>
								<h1>Account</h1>
								<EditUserForm isAccountsPage={true} isChangePassword={changePassword} userId={userProfile.id}/>
							</div>
							{
								joinOrganization ? 
								(
									<div className = "tw-w-1/2">
										<h1>Join Organization</h1>	
										<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
											 <div>
											    <label className = "label" htmlFor = "join-organization">
											    	Organization:
											    </label>
												<Controller
													name={"organizationId"}
													control={control}
													rules={registerOptions.organizationId}
													render={({field: {onChange, value, name, ref}}) => (
														<AsyncSelect 
															urlParams={{getJoinedOrgs: false}} 
															onSelect={(selectedOption: OptionType | null) => {
										                		const val = selectedOption?.value ?? ""
																setValue("organizationId", Number(val))
															}} 
															endpoint={USER_PROFILE_ORG_URL} 
															className = "tw-w-full"
														/>
													)}
												/>
										        {errors?.organizationId && <small className = "--text-alert">{errors.organizationId.message}</small>}
										    </div>	
										    <div>
										    	<button className = "button" type="submit">Send Request</button>
										    </div>
										</form>
									</div>
								) : null
							}
							{
								notificationSettings ? (
									<UserNotificationTypeForm/>
								) : null	
							}
						
						</div>
					</>
				: null
				}
			</div>
		</div>
	)
}
