import React, {useState, useEffect} from "react"
import { useResetPasswordMutation, useValidateTokenQuery } from "../services/public/auth"
import { useAppDispatch } from "../hooks/redux-hooks"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { LOGIN } from "../helpers/routes"
import { LoadingButton } from "../components/page-elements/LoadingButton"
import { useForm } from "react-hook-form"
import { IconEye } from "../components/icons/IconEye"
import { IconEyeSlash } from "../components/icons/IconEyeSlash"

interface FormValues {
	password: string
	confirmPassword: string
}

export const ResetPassword = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const {data, isLoading, isError} = useValidateTokenQuery({type: "reset-password", token: searchParams.get("token") ?? ""})
	const [resetPassword, {isLoading: isResetPasswordLoading, error}] = useResetPasswordMutation()
	const [showPassword, setShowPassword] = useState(false)

	const defaultForm: FormValues = {
		password: "",
		confirmPassword: "",
	}

	const { control, register, reset, handleSubmit, setValue, formState: {errors} } = useForm<FormValues>()

	const registerOptions = {
		password: {
			required: "Password is required"
		},
		confirmPassword: {
			required: "Confirm Password is required"
		}
	}

	useEffect(() => {
		if (isError){
    		navigate(LOGIN, {state: {"alert": "Token is invalid. Please re-submit your password reset request."}, replace: true})
		}
	}, [isError])

	const onSubmit = async (values: FormValues) => {
		try {
			await resetPassword({
				...values,
				token: searchParams.get("token") ?? ""
			}).unwrap()
    		navigate(LOGIN, {state: {"alert": "Password reset successfully!"}, replace: true})
		}
		catch (e){

		}
	}

	return (
		isLoading ? <LoadingSpinner/> : (
			<div>
				<h1>Reset Password</h1>		
				<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-4">
					{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`register_error_${i}`}>{errorMessage}</p>)) : null}
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
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
			        </div>
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
								<button onClick={(e) => {
									e.preventDefault()
									setShowPassword(!showPassword)}
								}><IconEye className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" /></button> : 
								<button onClick={(e) => {
									e.preventDefault()
									setShowPassword(!showPassword)}
								}><IconEyeSlash className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4"/></button>
							}
						</div>
				        {errors?.confirmPassword && <small className = "--text-alert">{errors.confirmPassword.message}</small>}
			        </div>
			        <div>
			        	<LoadingButton type="submit" className = "button" text="Submit"/>
			        </div>
				</form>
			</div>
		)
	)
}
