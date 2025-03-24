import React, {useState, useEffect} from "react"
import { useAppDispatch } from "../hooks/redux-hooks"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { LOGIN } from "../helpers/routes"
import { LoadingButton } from "../components/page-elements/LoadingButton"
import { useValidateTokenQuery } from "../services/public/auth"
import { useResendActivationMutation, useActivateAccountMutation } from "../services/public/register"


interface UserFormValues {
	email: string
}

export const AccountActivation = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const {data: token, isLoading, isError} = useValidateTokenQuery({type: "activate", token: searchParams.get("token") ?? ""})
	const [activateAccount, {isLoading: isActivateAccountLoading, error: activateAccountError}] = useActivateAccountMutation()
	const [resendActivation, {isLoading: isResendActivationLoading, error: resendActivationError}] = useResendActivationMutation()

	const resendLink = async () => {
		try {
			await resendActivation({token: searchParams.get("token") ?? ""}).unwrap()
    		navigate(LOGIN, {state: {"alert": "Account activation link has been resent! Please check your email for an updated activation link."}, replace: true})
		}
		catch (e){

		}
	}

	const activate = async () => {
		try {
			await activateAccount({token: searchParams.get("token") ?? ""}).unwrap()
    		navigate(LOGIN, {state: {"alert": "Account activated succesfully!"}, replace: true})
		}
		catch (e){

		}
	}

	return (
		<div>
			<h1>Account Activation</h1>
			{isError ? (
				<div className = "tw-flex tw-flex-col tw-gap-y-4">
					<p>It appears your activation link has expired. Please click the "resend" button below to receive
					another activation link in your email.</p>
					{resendActivationError && "status" in resendActivationError ? (resendActivationError?.data?.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`activation_resend_error_${i}`}>{errorMessage}</p>)) : null}
					<LoadingButton onClick={resendLink} text={"Resend"}/>
				</div>
			) : (
				<div className = "tw-flex tw-flex-col tw-gap-y-4">
					<p>Please click "confirm" below to activate your account.</p>	
					{activateAccountError && "status" in activateAccountError ? (activateAccountError?.data?.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`activation_error_${i}`}>{errorMessage}</p>)) : null}
					<LoadingButton onClick={activate} text={"Confirm"}/>
				</div>
			)
		}	
		</div>
	)
}
