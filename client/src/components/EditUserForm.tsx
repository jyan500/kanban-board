import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { toggleShowModal, setModalProps } from "../slices/modalSlice" 
import { useLazyGetUserProfileQuery, useLazyGetUserQuery, useEditOwnUserProfileMutation, useEditUserProfileMutation } from "../services/private/userProfile"
import { useForm, Controller } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { UserProfile, OptionType } from "../types/common"
import { parseDelimitedWord } from "../helpers/functions"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { IconEye } from "./icons/IconEye"
import { IconEyeSlash } from "./icons/IconEyeSlash"
import { PasswordRules } from "./page-elements/PasswordRules"
import { LoadingSkeleton } from "./page-elements/LoadingSkeleton"
import { ColumnFormPlaceholder } from "./placeholders/ColumnFormPlaceholder"
import { BackendErrorMessage } from "./page-elements/BackendErrorMessage"
import { LoadingButton } from "./page-elements/LoadingButton"
import { Select } from "./page-elements/Select"
import { Label } from "./page-elements/Label"

type FormValues = {
	id?: number 
	firstName: string
	lastName: string
	email: string
	userRoleId?: OptionType
	password?: string
	changePassword?: boolean
	confirmPassword?: string
	confirmExistingPassword?: string
}

type Props = {
	userId: number
	isAccountsPage: boolean
	isChangePassword: boolean
}

export const EditUserForm = ({userId, isAccountsPage, isChangePassword}: Props) => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const [showPassword, setShowPassword] = useState(false)
	const { userRoles, userRolesForSelect } = useAppSelector((state) => state.userRole)
	const defaultForm: FormValues = {
		id: undefined,
		firstName: "",
		lastName: "",
		email: "",
		userRoleId: {label: "", value: ""},
		...isChangePassword ? {
			changePassword: isChangePassword,
			password: "",
			confirmPassword: "",
			confirmExistingPassword: "",
		} : {}
	}
	const [ editUserProfile, {isLoading: isEditUserLoading, error: userError} ] = useEditUserProfileMutation() 
	const [ editOwnUserProfile, {isLoading: isEditOwnUserLoading, error: ownUserError} ] = useEditOwnUserProfileMutation()
	const [triggerGetUser, { data: userInfo, isLoading: isUserDataLoading, isFetching: isUserDataFetching  }] = useLazyGetUserQuery()
	const [triggerGetUserProfile, { data: userProfileInfo, isLoading: isUserProfileDataLoading}] = useLazyGetUserProfileQuery()
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset, watch, control, setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    firstName: { required: "First Name is required" },
	    lastName: { required: "Last Name is required" },
	    email: { required: "Email is required"},
    	userRoleId: { required: "User Role is required" },
    	...isChangePassword ? {
	    	password: { required: "Password is required"},	
	    	confirmExistingPassword: {required: "Confirm Existing Password is required"},
	    	confirmPassword: {required: "Confirm Password is required"},
    	} : {}
    }

	useEffect(() => {
		if (userId){
			if (!isAccountsPage){
				triggerGetUser(userId)
			}
			else {
				triggerGetUserProfile()
			}
		}
	}, [userId, isAccountsPage])

	useEffect(() => {
		// initialize with current values if the user exists
		if (userId){
			let info = !isAccountsPage ? userInfo : userProfileInfo
			// everything except organization
			if (info){
				const {organizationId, ...userWithoutOrganization} = info
				reset({
					...userWithoutOrganization, 
					userRoleId: {
						label: userRolesForSelect.find((userRole) => info.userRoleId?.toString() === userRole.value)?.label ?? "",
						value: info.userRoleId?.toString() ?? "",
					},
					changePassword: isAccountsPage && isChangePassword
				})
			}
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, userInfo, userProfileInfo, isAccountsPage, userId, isChangePassword, userRolesForSelect])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id){
				if (!isAccountsPage){
					await editUserProfile({...values, 
						userRoleId: !isNaN(Number(values.userRoleId?.value)) ? Number(values.userRoleId?.value) : 0}).unwrap()
		    		dispatch(toggleShowModal(false))
		    		dispatch(setModalProps({}))
				}
				else {
					await editOwnUserProfile(values).unwrap()
				}
	    		dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: `User updated successfully!`,
	    		}))
    		}
    	}
    	catch {
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to update user.`,
    		}))
    	}
    }

    if (isUserDataLoading){
    	return (
			<LoadingSkeleton width = "tw-w-full" height = "tw-h-[000px]">
				<ColumnFormPlaceholder/>
			</LoadingSkeleton> 
		)
    }

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<BackendErrorMessage error={ownUserError}/>
			<BackendErrorMessage error={userError}/>
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				{!isChangePassword ? 
				(
				<>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
					    <Label htmlFor = "edit-user-firstname">
					    	First Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </Label>
						<input 
						id = "edit-user-firstname"
						type="text"
						className = "tw-w-full"
						{...register("firstName", registerOptions.firstName)}
						/>
				        {errors?.firstName && <small className = "--text-alert">{errors.firstName.message}</small>}
			        </div>
			    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
					    <Label htmlFor = "edit-user-lastname">
					    	Last Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </Label>
						<input 
						id = "edit-user-lastname"
						type="text"
						className = "tw-w-full"
						{...register("lastName", registerOptions.lastName)}
						/>
				        {errors?.lastName && <small className = "--text-alert">{errors.lastName.message}</small>}
			        </div>
			    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
					    <Label htmlFor = "edit-user-email">
					    	Email: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </Label>
						<input 
						id = "edit-user-email"
						type="text"
						className = "tw-w-full"
						{...register("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				 	</div>
			    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
			    		{!isAccountsPage ? (
			    			<>
							    <Label htmlFor = "edit-user-role">
							    	User Role: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </Label>
								<Controller
									name="userRoleId"
									control={control}
									render={({field: {onChange}}) => {
										return (
											<Select
												id={"edit-user-role"}
												options={userRolesForSelect}
												defaultValue={watch("userRoleId") ?? {label: "", value: ""}}
												onSelect={(selectedOption: OptionType | null) => {
													if (selectedOption){
														onChange(selectedOption)
													}
												}}
											/>
										)
									}}
								>
								</Controller>
						        {errors?.userRoleId && <small className = "--text-alert">{errors.userRoleId.message}</small>}
					        </>
		    			) : null}
			        </div>
		        </>
		        ) : null}
		        {
			        isAccountsPage && isChangePassword ? (
			        <>
			        	<div>
					    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
							    <Label htmlFor = "register-password">
							    	Existing Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </Label>
								<input 
								id = "register-password"
								type="password"
								className = "tw-w-full"
								{...register("confirmExistingPassword", registerOptions.confirmExistingPassword)}
								/>
						        {errors?.confirmExistingPassword && <small className = "--text-alert">{errors.confirmExistingPassword.message}</small>}
					        </div>
					    </div>
				        <div>
					    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
							    <Label htmlFor = "register-password">
							    	Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </Label>
								<input 
								id = "register-password"
								type={!showPassword ? "password" : "text"}
								className = "tw-w-full"
								{...register("password", registerOptions.password)}
								/>
								<PasswordRules password={watch("password") ?? ""}/>
						        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
					        </div>
					    </div>
					    <div>
					    	<div className = "tw-flex tw-flex-col tw-gap-y-2">
							    <Label htmlFor = "register-confirm-password">
							    	Confirm Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </Label>
							    <div className = "tw-mt-2 tw-relative">
									<input 
									id = "register-confirm-password"
									type={!showPassword ? "password" : "text"}
									className = "tw-w-full"
									{...register("confirmPassword", registerOptions.confirmPassword)}
									/>
									{
										!showPassword ? 
										<button onClick={(e) => {
											e.preventDefault()
											setShowPassword(!showPassword)}
										}><IconEye className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" /></button> :
										<button onClick={(e) => {
											e.preventDefault()
											setShowPassword(!showPassword)
										}}><IconEyeSlash className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4"/></button>
									}
								</div>
						        {errors?.confirmPassword && <small className = "--text-alert">{errors.confirmPassword.message}</small>}
					        </div>
					    </div>
				    </>
				    ): null
		        }
		        <div>
		        	<LoadingButton isLoading={isEditUserLoading || isEditOwnUserLoading} type = "submit" text="Submit"/>
		        </div>
			</form>
		</div>
	)	
}
