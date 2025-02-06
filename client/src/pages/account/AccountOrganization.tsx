import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { FormValues, OrganizationForm } from "../../components/OrganizationForm"
import { useRegisterOrganizationMutation } from "../../services/private/userProfile"

export const AccountOrganization = () => {
	const navigate = useNavigate()
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
			<div className = "tw-w-1/4">	
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<h1>Create Organization</h1>
				<p>By creating an organization under this account, you will automatically be added as the admin of the new organization. </p>
				{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`org_error_${i}`}>{errorMessage}</p>)) : null}
				<OrganizationForm onSubmit={onSubmit}/>
			</div>
			<div className = "tw-w-1/4">	
			</div>
		</div>
	)	
}
