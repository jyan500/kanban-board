import React, {useState, useEffect} from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { FormValues, OrganizationForm } from "../../components/OrganizationForm"
import { useRegisterOrganizationMutation } from "../../services/private/userProfile"
import { useAppSelector } from "../../hooks/redux-hooks"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { BackendErrorMessage } from "../../components/page-elements/BackendErrorMessage"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

export const AccountOrganization = () => {
	const navigate = useNavigate()
	const { userProfile } = useAppSelector((state) => state.userProfile)	
	const [ registerOrganization, {isLoading, error}] = useRegisterOrganizationMutation()

	const onSubmit = async (values: FormValues) => {
		try {
			await registerOrganization(values).unwrap()
    		navigate("/", {state: {type: "success", alert: "Organization registered successfully! You can use the dropdown to switch to your new organization."}, replace: true})
		}
		catch (e){

		}
	}

	return (
		<div className = "tw-flex tw-flex-row">
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<h1 className={PRIMARY_TEXT}>Create Organization</h1>
				<p className={SECONDARY_TEXT}>By creating an organization under this account, you will automatically be added as the admin of the new organization. </p>
				<BackendErrorMessage error={error}/>
				<OrganizationForm onSubmit={onSubmit}/>
			</div>
		</div>
	)	
}
