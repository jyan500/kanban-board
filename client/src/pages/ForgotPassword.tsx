import React from "react"
import { useAppDispatch } from "../hooks/redux-hooks"
import { useNavigate } from "react-router-dom"
import { useForgotPasswordMutation } from "../services/public/auth"
import { useForm } from "react-hook-form"
import { LOGIN } from "../helpers/routes"
import { LoadingButton } from "../components/page-elements/LoadingButton"
import { BackendErrorMessage } from "../components/page-elements/BackendErrorMessage"

interface UserFormValues {
	email: string
}

export const ForgotPassword = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const defaultForm: UserFormValues = {
		email: "",
	}
	const { control, register, reset, handleSubmit, setValue, formState: {errors} } = useForm<UserFormValues>()
	const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation()

	const registerOptions = {
	    email: { required: "Email is required" },
    }

    const onSubmit = async (values: UserFormValues) => {
    	try {
    		await forgotPassword(values).unwrap()
    		navigate(LOGIN, {state: {"alert": "Please check your email for the reset password link."}, replace: true})
    	}
    	catch (e) {

    	}
    }

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h1>Forgot Password</h1>
			<div className = "tw-text-gray-600 tw-text-sm">
				<p>Please enter the email on your account.</p> 
				<p>After submitting, you will be sent an email to reset your password.</p>
			</div>
			<form className = "tw-flex tw-flex-col tw-gap-y-4" onSubmit={handleSubmit(onSubmit)}>
				<BackendErrorMessage error={error}/>
				<div>
				    <label className = "label" htmlFor = "register-email">
				    	Email: <span className = "tw-font-bold tw-text-red-500">*</span>
				    </label>
					<input 
					id = "register-email"
					type="text"
					className = "tw-w-full"
					{...register("email", registerOptions.email)}
					/>
			        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
			 	</div>	
			 	<div>
			    	<LoadingButton isLoading={isLoading} className = "button" type = "submit" text = "Submit"/>
			 	</div>
		 	</form>
		</div>
	)
}
