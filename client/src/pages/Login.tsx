import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { setCredentials } from "../slices/authSlice" 
import { useLoginMutation } from "../services/public/auth" 
import {v4 as uuidv4} from "uuid"
import { useLocation, useNavigate, Link } from "react-router-dom" 
import { Controller, useForm } from "react-hook-form"
import { parseErrorResponse } from "../helpers/functions"
import { REGISTER, FORGOT_PASSWORD, TEMP, ACCOUNT } from "../helpers/routes"
import { ORGANIZATION_URL } from "../helpers/urls"
import { AsyncSelect } from "../components/AsyncSelect"
import { OptionType } from "../types/common"
import { BackendErrorMessage } from "../components/page-elements/BackendErrorMessage"
import { LoadingButton } from "../components/page-elements/LoadingButton"
import { IconEye } from "../components/icons/IconEye"
import { IconEyeSlash } from "../components/icons/IconEyeSlash"

type FormValues = {
	email: string
	password: string
	organizationId: number
}

export const Login = () => {
	const dispatch = useAppDispatch()
	const location = useLocation()
	const navigate = useNavigate()
	const [login, { isLoading, error }] = useLoginMutation()
	const { token, isTemp } = useAppSelector((state) => state.auth)
	const { control, register , handleSubmit, setValue, formState: {errors} } = useForm<FormValues>()
	const registerOptions = {
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    organizationId: { required: "Organization is required"},
    }
    const [showPassword, setShowPassword] = useState(false)
    useEffect(() => {
    	if (token){
    		navigate(isTemp ? `${TEMP}${ACCOUNT}` : "/", {replace: true})
    	}	
    }, [navigate, token])

    useEffect(() => {
    	window.history.replaceState(null, location.pathname)
    }, [])

	const onSubmit = async (values: FormValues) => {
		try {
			const data = await login(values).unwrap()
			dispatch(setCredentials(data))
		}
		catch (err) {
			console.log(err)
		}
	}
	return (
		<div className = "tw-w-full">
			{/* checking if "status" in error narrows down the type to the CustomError defined in services/auth.ts,
			 rather than SerializedError Type */}
			<form className = "tw-flex tw-flex-col tw-gap-y-4" onSubmit={handleSubmit(onSubmit)}>
				<div><h1>Login</h1></div>
				<BackendErrorMessage error={error}/>
				{location.state?.alert ? <p>{location.state.alert}</p> : null}
				<div>
					<div>
					    <label className = "label" htmlFor = "login-email">
					    	Email: 
					    </label>
						<input 
						id="login-email"
						type="text"
						className = "tw-w-full"
						{...register("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				    </div>
				</div>
				<div>
				    <div>
					    <label className = "label" htmlFor = "login-password">
					    	Password:
					    </label>
					    <div className = "tw-mt-2 tw-relative">
							<input 
								id = "login-password"
								type={!showPassword ? "password" : "text"}
								className = "tw-w-full"
								{...register("password", registerOptions.password)}
							/>
							{
								!showPassword ? 
								<button onClick={(e) => {
									e.preventDefault()
									setShowPassword(!showPassword)}
								}><IconEye className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4"/></button> : 
								<button onClick={(e) => {
									e.preventDefault()
									setShowPassword(!showPassword)}
								}><IconEyeSlash className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4"/></button>
							}
						</div>
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
				    </div>
				</div>
				<div>
				    <div>
					    <label className = "label" htmlFor = "login-organization">
					    	Organization:
					    </label>
						<Controller
							name={"organizationId"}
							control={control}
							rules={registerOptions.organizationId}
							render={({field: {onChange, value, name, ref}}) => (
								<AsyncSelect 
									urlParams={{}} 
									onSelect={(selectedOption: OptionType | null) => {
				                		const val = selectedOption?.value ?? ""
										setValue("organizationId", Number(val))
									}} 
									endpoint={ORGANIZATION_URL} 
									className = "tw-w-full"
								/>
							)}
						/>
				        {errors?.organizationId && <small className = "--text-alert">{errors.organizationId.message}</small>}
				    </div>
				</div>
				<div>
				    <div>
						<LoadingButton isLoading={isLoading} className = "button" type = "submit" text="Submit"/>
					</div>
				</div>
				<div className = "tw-flex tw-flex-col tw-gap-y-2">
					<div>
						<small>Don't have an account? Click <Link className = "tw-text-sky-500" to={REGISTER}>Here</Link> to Register</small>
					</div>
					<div>
						<small>Forgot Password? Click <Link className = "tw-text-sky-500" to={FORGOT_PASSWORD}>Here</Link></small>
					</div>
				</div>
			</form>
		</div>
	)	
}