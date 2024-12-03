import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal, setModalProps } from "../../slices/modalSlice" 
import { useGetUserQuery, useEditUserProfileMutation } from "../../services/private/userProfile"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../../slices/toastSlice" 
import { LoadingSpinner } from "../LoadingSpinner"
import { UserProfile } from "../../types/common"
import { parseDelimitedWord } from "../../helpers/functions"
import { skipToken } from '@reduxjs/toolkit/query/react'

type FormValues = {
	id?: number 
	firstName: string
	lastName: string
	email: string
	userRoleId: number | string
}

type Props = {
	userId: number
}

export const EditUserFormModal = ({userId}: Props) => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const { userRoles } = useAppSelector((state) => state.userRole)
	const { currentBoardId } = useAppSelector((state) => state.boardInfo)
	const defaultForm: FormValues = {
		id: undefined,
		firstName: "",
		lastName: "",
		email: "",
		userRoleId: ""
	}
	const [ editUserProfile ] = useEditUserProfileMutation() 
	const { data: userInfo, isLoading: isUserDataLoading  } = useGetUserQuery(userId ? userId : skipToken)
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    firstName: { required: "First Name is required" },
	    lastName: { required: "Last Name is required" },
	    email: { required: "Email is required"},
	    userRoleId: { required: "User Role is required" },
    }
	useEffect(() => {
		// initialize with current values if the user exists
		if (userId && userInfo){
			// everything except organization
			const {organizationId, ...userWithoutOrganization} = userInfo
			reset(userWithoutOrganization)
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, userInfo, userId])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id){
				await editUserProfile({...values, userRoleId: !isNaN(Number(values.userRoleId)) ? Number(values.userRoleId) : 0}).unwrap()
	    		dispatch(toggleShowModal(false))
	    		dispatch(setModalProps({}))
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

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
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
									<option value = {userRole.id}>{parseDelimitedWord(userRole.name, "_")}</option>
								)
							})
						}
					</select>
			        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
		        </div>
		        <div>
		        	<button type = "submit" className = "button">Submit</button>
		        </div>
			</form>
		</div>
	)	
}
