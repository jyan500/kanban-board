import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { toggleShowModal, setModalProps } from "../slices/modalSlice" 
import { useGetUserQuery, useEditOwnUserProfileMutation, useEditUserProfileMutation } from "../services/private/userProfile"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { UserProfile } from "../types/common"
import { parseDelimitedWord } from "../helpers/functions"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { PasswordRules } from "./page-elements/PasswordRules"
import { LoadingSkeleton } from "./page-elements/LoadingSkeleton"
import { ColumnFormPlaceholder } from "./placeholders/ColumnFormPlaceholder"

type FormValues = {
	id?: number 
	firstName: string
	lastName: string
	email: string
	userRoleId?: number | string
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
	const { userRoles } = useAppSelector((state) => state.userRole)
	const { currentBoardId } = useAppSelector((state) => state.boardInfo)
	const defaultForm: FormValues = {
		id: undefined,
		firstName: "",
		lastName: "",
		email: "",
		userRoleId: "",
		...isChangePassword ? {
			changePassword: isChangePassword,
			password: "",
			confirmPassword: "",
			confirmExistingPassword: "",
		} : {}
	}
	const [ editUserProfile, {isLoading: isEditUserLoading, error: userError} ] = useEditUserProfileMutation() 
	const [ editOwnUserProfile, {isLoading: isEditOwnUserLoading, error: ownUserError} ] = useEditOwnUserProfileMutation()
	const { data: userInfo, isLoading: isUserDataLoading, isFetching: isUserDataFetching  } = useGetUserQuery(userId ? userId : skipToken)
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset, watch, setValue, getValues, formState: {errors} } = useForm<FormValues>({
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
		// initialize with current values if the user exists
		if (userId && userInfo){
			// everything except organization
			const {organizationId, ...userWithoutOrganization} = userInfo
			reset({...userWithoutOrganization, changePassword: isAccountsPage && isChangePassword})
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, userInfo, userId, isChangePassword])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id){
				if (!isAccountsPage){
					await editUserProfile({...values, userRoleId: !isNaN(Number(values.userRoleId)) ? Number(values.userRoleId) : 0}).unwrap()
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

    if (isUserDataFetching){
    	return (
			<LoadingSkeleton width = "tw-w-full" height = "tw-h-[000px]">
				<ColumnFormPlaceholder/>
			</LoadingSkeleton> 
		)
    }

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			{ownUserError && "status" in ownUserError ? (ownUserError?.data?.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`register_error_${i}`}>{errorMessage}</p>)) : null}
			{userError && "status" in userError ? (userError?.data?.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`register_error_${i}`}>{errorMessage}</p>)) : null}
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				{!isChangePassword ? 
				(
				<>
					<div>
					    <label className = "label" htmlFor = "edit-user-firstname">
					    	First Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "edit-user-firstname"
						type="text"
						className = "tw-w-full"
						{...register("firstName", registerOptions.firstName)}
						/>
				        {errors?.firstName && <small className = "--text-alert">{errors.firstName.message}</small>}
			        </div>
			    	<div>
					    <label className = "label" htmlFor = "edit-user-lastname">
					    	Last Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "edit-user-lastname"
						type="text"
						className = "tw-w-full"
						{...register("lastName", registerOptions.lastName)}
						/>
				        {errors?.lastName && <small className = "--text-alert">{errors.lastName.message}</small>}
			        </div>
			    	<div>
					    <label className = "label" htmlFor = "edit-user-email">
					    	Email: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "edit-user-email"
						type="text"
						className = "tw-w-full"
						{...register("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				 	</div>
			    	<div>
			    		{!isAccountsPage ? (
			    			<>
							    <label className = "label" htmlFor = "edit-user-role">
							    	User Role: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </label>
								<select 
								id = "edit-user-role"
								className = "tw-w-full"
								{...register("userRoleId", registerOptions.userRoleId)}
								>
									<option value = "" disabled></option>
									{
										userRoles.map((userRole) => {
											return (
												<option key={`user-role-${userRole.id}`} value = {userRole.id}>{parseDelimitedWord(userRole.name, "_")}</option>
											)
										})
									}
								</select>
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
					    	<div>
							    <label className = "label" htmlFor = "register-password">
							    	Existing Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </label>
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
					    	<div>
							    <label className = "label" htmlFor = "register-password">
							    	Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </label>
								<input 
								id = "register-password"
								type="password"
								className = "tw-w-full"
								{...register("password", registerOptions.password)}
								/>
								<PasswordRules password={watch("password") ?? ""}/>
						        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
					        </div>
					    </div>
					    <div>
					    	<div>
							    <label className = "label" htmlFor = "register-confirm-password">
							    	Confirm Password: <span className = "tw-font-bold tw-text-red-500">*</span>
							    </label>
							    <div className = "tw-mt-2 tw-relative">
									<input 
									id = "register-confirm-password"
									type={!showPassword ? "password" : "text"}
									className = "tw-w-full"
									{...register("confirmPassword", registerOptions.confirmPassword)}
									/>
									{
										!showPassword ? 
										<FaEye className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" onClick={() => setShowPassword(!showPassword)}/> : 
										<FaEyeSlash className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" onClick={() => setShowPassword(!showPassword)}/>
									}
								</div>
						        {errors?.confirmPassword && <small className = "--text-alert">{errors.confirmPassword.message}</small>}
					        </div>
					    </div>
				    </>
				    ): null
		        }
		        <div>
		        	<button type = "submit" className = "button">Submit</button>
		        </div>
			</form>
		</div>
	)	
}
