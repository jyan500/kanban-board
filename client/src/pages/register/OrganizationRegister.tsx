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

export const OrganizationRegister = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [currentIndex, setCurrentIndex] = useState(0)
	const [completedSteps, setCompletedSteps] = useState({
		0: false,
		1: false,
	})
	const [forms, setForms] = useState({
		"organization": {},
		"user": {},
	})

	const [organizationUserRegister, {isLoading, error}] = useOrganizationUserRegisterMutation()

    const setPage = (i: number) => {
        setCurrentIndex(i)
    }

    const onSubmitStep1 = (values: OrganizationFormValues) => {
    	setForms({...forms, "organization": values})
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
			<ArrowButton text="Back" onClick={() => navigate(-1)}/>
			{
				currentIndex === 0 ? (
					<>
						<h1>Register Organization</h1>
						<OrganizationForm/>
					</>
				) : null		
			}
			{
				currentIndex === 1 ? (
					<>
						<h1>Register Admin User</h1>
					</>
				) : null
			}
			<div>
				{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`org_user_error_${i}`}>{errorMessage}</p>)) : null}
			</div>	
		    <div className = "tw-p-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
                {
                    Array.from(Array(Object.keys(completedSteps).length), (_, i) => {
                        return (
                            <button key = {`page_${i}`} onClick={() => {
                            	if (i !== currentIndex && completedSteps[i as keyof typeof completedSteps]){
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