import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useNavigate, Link } from "react-router-dom" 
import { useForm, Resolver } from "react-hook-form"
import { useUserRegisterMutation } from "../services/public/register" 
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { v4 as uuidv4 } from "uuid" 
import { LOGIN } from "../helpers/routes"
import { useGetOrganizationQuery } from "../services/public/organization" 
import "../styles/register.css" 

type FormValues = {
	firstName: string
	lastName: string
	email: string
	password: string
	organizationId: number
	confirmPassword: string
}

export const Register = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { register: formRegister, handleSubmit, formState: {errors} } = useForm<FormValues>()
	const [ userRegister, { isLoading, error }] = useUserRegisterMutation()
	const {data: orgData} = useGetOrganizationQuery()
	const [showPassword, setShowPassword] = useState(false)
	const registerOptions = {
		firstName: { required: "First Name is required"},
		lastName: { required: "Last Name is required"},
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    confirmPassword: { required: "Confirm Password is required"},
	    organizationId: { required: "Organization is required"},
    }

	const onSubmit = async (values: FormValues) => {
		try {
			const data = await userRegister(values).unwrap()
    		navigate(LOGIN, {state: {"alert": "User registered successfully! Check your email to see when your selected organization has approved your account."}, replace: true})
		}
		catch (err) {
			console.log(err)
		}
	}

	return (
		<div className = "tw-w-full">
			<div><h1>Register</h1></div>
			<form className = "tw-flex tw-flex-col tw-gap-y-4" onSubmit={handleSubmit(onSubmit)}>
				{error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`register_error_${i}`}>{errorMessage}</p>)) : null}
				<div>
					<div>
					    <label className = "label" htmlFor = "register-firstname">
					    	First Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "register-firstname"
						type="text"
						className = "tw-w-full"
						{...formRegister("firstName", registerOptions.firstName)}
						/>
				        {errors?.firstName && <small className = "--text-alert">{errors.firstName.message}</small>}
			        </div>
			    </div>
			    <div>
			    	<div>
					    <label className = "label" htmlFor = "register-lastname">
					    	Last Name: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "register-lastname"
						type="text"
						className = "tw-w-full"
						{...formRegister("lastName", registerOptions.lastName)}
						/>
				        {errors?.lastName && <small className = "--text-alert">{errors.lastName.message}</small>}
			        </div>
			    </div>
			    <div>
			    	<div>
					    <label className = "label" htmlFor = "register-email">
					    	Email: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "register-email"
						type="text"
						className = "tw-w-full"
						{...formRegister("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				 	</div>
			    </div>
		        <div>
				    <label className = "label" htmlFor = "register-organization">
				    	Organization: <span className = "tw-font-bold tw-text-red-500">*</span>
				    </label>
					<select 
						className = "tw-w-full"
						id = "register-organization"
						{...formRegister("organizationId", registerOptions.organizationId)}
					>
						<option value = "">---</option>
						{ 
							orgData?.map((org) => <option key = {org.id} value = {org.id}>{org.name}</option>)
						}
					</select>
			        {errors?.organizationId && <small className = "--text-alert">{errors.organizationId.message}</small>}
			    </div>
			    <div>
			    	<div>
					    <label className = "label" htmlFor = "register-password">
					    	Password: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
						<input 
						id = "register-password"
						type="password"
						className = "tw-w-full"
						{...formRegister("password", registerOptions.password)}
						/>
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
			        </div>
			    </div>
			    <div>
			    	<div>
					    <label className = "label" htmlFor = "register-confirm-password">
					    	Confirm Password: <span className = "tw-font-bold tw-text-red-500">*</span>
					    </label>
					    <div className = "tw-mt-2 tw-relative">
							<input 
							id = "register-confirm-password"
							type={!showPassword ? "password" : "text"}
							className = "tw-w-full"
							{...formRegister("confirmPassword", registerOptions.confirmPassword)}
							/>
							{
								!showPassword ? 
								<FaEye className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" onClick={() => setShowPassword(!showPassword)}/> : 
								<FaEyeSlash className = "hover:tw-opacity-60 tw-absolute tw-top-0 tw-right-0 tw-mt-4 tw-mr-4" onClick={() => setShowPassword(!showPassword)}/>
							}
						</div>
				        {errors?.confirmPassword && <small className = "--text-alert">{errors.confirmPassword.message}</small>}
			        </div>
			    </div>
			    <div>
				    <div>
						<button className = "button" type = "submit">Submit</button>
					</div>
				</div>
				<div>
					<div>
						<small>Already have an account? Click <Link className = "hover:tw-opacity-1 tw-text-sky-500" to={"/login"}>Here</Link> to login</small>
					</div>
				</div>
			</form>
		</div>	
	)	
}