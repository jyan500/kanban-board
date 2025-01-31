import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { useNavigate, Link } from "react-router-dom" 
import { useForm, Resolver, Controller } from "react-hook-form"
import { useUserRegisterMutation } from "../../services/public/register" 
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { v4 as uuidv4 } from "uuid" 
import { LOGIN } from "../../helpers/routes"
import "../../styles/register.css" 
import { AsyncSelect } from "../../components/AsyncSelect"
import { OptionType } from "../../types/common"
import { ORGANIZATION_URL } from "../../helpers/urls"
import { FormValues as OrganizationFormValues, OrganizationForm } from "../../components/OrganizationForm"
import {
	useOrganizationUserRegisterMutation
} from "../../services/public/register"
import { FormValues as UserFormValues, RegisterUserForm } from "../../components/forms/RegisterUserForm"
import { addToast } from "../../slices/toastSlice" 
import { ArrowButton } from "../../components/page-elements/ArrowButton"

export type OrgUserRegistrationForm = {
	organization: OrganizationFormValues
	user: UserFormValues
}

export const OrganizationRegister = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [viewableSteps, setViewableSteps] = useState({
		0: true,
		1: false,
	})
	const [forms, setForms] = useState<OrgUserRegistrationForm>({
		"organization": {} as OrganizationFormValues,
		"user": {} as UserFormValues,
	})

	const [organizationUserRegister, {isLoading, error}] = useOrganizationUserRegisterMutation()

    const setPage = (i: number) => {
        setCurrentIndex(i)
    }

    const onSubmitStep1 = (values: OrganizationFormValues) => {
    	setForms({...forms, "organization": values})
    	setViewableSteps({...viewableSteps, 1:true})
    	setPage(1)
    }

    const onSubmitStep2 = async (values: UserFormValues) => {
    	const toSubmit = {...forms, "user": values}
    	setForms(toSubmit)
    	try {
	    	await organizationUserRegister(toSubmit).unwrap()
    		navigate(LOGIN, {state: {"alert": "Organization and user registered successfully! You can now login to your organization."}, replace: true})
    	}
    	catch (e) {
    		console.log(e)
    	}
    }

	return (
		<div className = "tw-w-full">
			{
				currentIndex === 0 ? 	
					(<ArrowButton text="Back" onClick={() => navigate(-1)}/>)
				: null
			}
			{
				currentIndex === 0 ? (
					<>
						<h1>Register Organization</h1>
						<OrganizationForm isOrgRegister={true} organization={Object.keys(forms.organization).length > 0 ? forms.organization : undefined} onSubmit={onSubmitStep1}/>
					</>
				) : null		
			}
			{
				currentIndex === 1 ? (
					<>
						<h1>Register Admin User</h1>
						<RegisterUserForm isOrgRegister={true} user={Object.keys(forms.user).length > 0 ? forms.user : undefined} onSubmit={onSubmitStep2}/>
					</>
				) : null
			}
			<div>
				{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`org_user_error_${i}`}>{errorMessage}</p>)) : null}
			</div>	
		    <div className = "tw-p-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
                {
                    Array.from(Array(Object.keys(viewableSteps).length), (_, i) => {
                        return (
                            <button key = {`page_${i}`} onClick={() => {
                            	if (i !== currentIndex && viewableSteps[i as keyof typeof viewableSteps]){
	                            	setPage(i)
                            	}
                            }}><div className = {`tw-transition tw-w-3 tw-h-3 tw-bg-gray-800 tw-rounded-full ${currentIndex === i ? "tw-p-2" : "tw-bg-opacity-50"}`}></div></button>
                        )
                    })
                }   
            </div>
		</div>	
	)	
}