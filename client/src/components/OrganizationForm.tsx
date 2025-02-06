import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { 
	useUpdateOrganizationMutation
} from "../services/private/organization" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { Organization } from "../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { EMAIL_PATTERN, PHONE_PATTERN } from "../helpers/constants"

export type FormValues = {
	id?: number
	name: string
	address: string
	city: string
	state: string
	zipcode: string
	phoneNumber: string
	email: string
	industry: string
}

type Props = {
	isOrgRegister?: boolean
	organization?: Organization | FormValues | undefined
	onSubmit?: (values: FormValues) => void
}

export const OrganizationForm = ({isOrgRegister, organization, onSubmit: propsSubmit}: Props) => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		address: "",
		city: "",
		state: "",
		zipcode: "",
		phoneNumber: "",
		email: "",
		industry: ""
	}
	const [ updateOrganization, {isLoading: isUpdateOrganizationLoading, error} ] = useUpdateOrganizationMutation()
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    name: { required: "Name is required" },
	    email: {
	    	required: "Email is required",
	    	pattern: {
	            value: EMAIL_PATTERN,
	            message: "Please enter a valid email.",
	        }
	    },
	    phoneNumber: {
	    	required: "Phone Number is required",
	    	pattern: {
	    		value: PHONE_PATTERN,
	    		message: "Please enter a valid phone number."
	    	}
	    },
    }
	useEffect(() => {
		if (organization && Object.keys(organization).length > 0){
			reset(organization)
		}
		else {
			reset(defaultForm)
		}
	}, [organization])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id != null && organization){
    			await updateOrganization({id: !isNaN(Number(values.id)) ? Number(values.id) : 0, ...values}).unwrap()
    		}	
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Organization updated successfully!`,
    		}))
    	}
    	catch {
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to update organization.`,
    		}))
    	}
    }

	return (
		<div className = "tw-flex tw-flex-col">
			{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`org_error_${i}`}>{errorMessage}</p>)) : null}
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(propsSubmit ?? onSubmit)}>
				<div>
					<label className = "label" htmlFor = "organization-name">Name: <span className = "tw-font-bold tw-text-red-500">*</span></label>
					<input id = "organization-name" className = "tw-w-full" type = "text"
					{...register("name", registerOptions.name)}
					/>
			        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
				</div>
				{
					!isOrgRegister ? (
						<div className = "tw-flex tw-flex-row tw-gap-x-2">
							<div className = "tw-flex tw-flex-col">
								<label className = "label" htmlFor = "organization-name">Address:</label>
								<input id = "organization-address" type = "text"
								{...register("address")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col">
								<label className = "label" htmlFor = "organization-name">City:</label>
								<input id = "organization-city" type = "text"
								{...register("city")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col tw-w-16">
								<label className = "label" htmlFor = "organization-state">State:</label>
								<input id = "organization-state" type = "text"
								{...register("state")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col tw-w-32">
								<label className = "label" htmlFor = "organization-zipcode">Zipcode:</label>
								<input id = "organization-zipcode" type = "text"
								{...register("zipcode")}
								/>
							</div>
						</div>	
					) : (
						<>
							<div className = "tw-flex tw-flex-col">
								<label className = "label" htmlFor = "organization-name">Address:</label>
								<input id = "organization-address" type = "text"
								{...register("address")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col">
								<label className = "label" htmlFor = "organization-name">City:</label>
								<input id = "organization-city" type = "text"
								{...register("city")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col tw-w-16">
								<label className = "label" htmlFor = "organization-state">State:</label>
								<input id = "organization-state" type = "text"
								{...register("state")}
								/>
							</div>
							<div className = "tw-flex tw-flex-col tw-w-32">
								<label className = "label" htmlFor = "organization-zipcode">Zipcode:</label>
								<input id = "organization-zipcode" type = "text"
								{...register("zipcode")}
								/>
							</div>
						</>
					)
				}

				<div className = "tw-flex tw-flex-col tw-gap-y-2">
			        {errors?.address && <small className = "--text-alert">{errors.address.message}</small>}
			        {errors?.city && <small className = "--text-alert">{errors.city.message}</small>}
			        {errors?.state && <small className = "--text-alert">{errors.state.message}</small>}
			        {errors?.zipcode && <small className = "--text-alert">{errors.zipcode.message}</small>}
				</div>
				<div>
					<label className = "label" htmlFor = "organization-phone">Phone:<span className = "tw-font-bold tw-text-red-500">*</span></label>
					<input id = "organization-phone" type = "text"
					{...register("phoneNumber", registerOptions.phoneNumber)}
					/>
			        {errors?.phoneNumber && <small className = "--text-alert">{errors.phoneNumber.message}</small>}
				</div>
				<div>
					<label className = "label" htmlFor = "organization-email">Email:<span className = "tw-font-bold tw-text-red-500">*</span></label>
					<input id = "organization-email" type = "text" className = "tw-w-full"
					{...register("email", registerOptions.email)}
					/>
			        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				</div>
				<div>
					<label className = "label" htmlFor = "organization-industry">Industry:</label>
					<input id = "organization-industry" type = "text" className = "tw-w-full"
					{...register("industry")}
					/>
			        {errors?.industry && <small className = "--text-alert">{errors.industry.message}</small>}
				</div>
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<button type = "submit" className = "button">{isOrgRegister ? "Next" : "Submit"}</button>
				</div>
			</form>
		</div>
	)	
}
