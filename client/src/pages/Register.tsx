import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useNavigate } from "react-router-dom" 
import { useForm, Resolver } from "react-hook-form"
import { useUserRegisterMutation } from "../services/public/register" 
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { v4 as uuidv4 } from "uuid" 
import "../styles/register.css" 

type FormValues = {
	firstName: string
	lastName: string
	email: string
	password: string
	confirmPassword: string
}

export const Register = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { register: formRegister, handleSubmit, formState: {errors} } = useForm<FormValues>()
	const [ userRegister, { isLoading, error }] = useUserRegisterMutation()
	const [showPassword, setShowPassword] = useState(false)
	const registerOptions = {
		firstName: { required: "First Name is required"},
		lastName: { required: "Last Name is required"},
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    confirmPassword: { required: "Confirm Password is required"}
    }

	const onSubmit = async (values: FormValues) => {
		try {
			const data = await userRegister(values).unwrap()
    		navigate("/login", {state: {"alert": "User registered successfully!"}})
		}
		catch (err) {
			console.log(err)
		}
	}

	return (
		<div className = "container --page-height">
			<div className = "sidebar-design"></div>
			<form className = "form-container --fixed-width" onSubmit={handleSubmit(onSubmit)}>
				<div><h1>Register</h1></div>
				{error && "status" in error ? (error.data.errors?.map((errorMessage) => <p className = "--text-alert" key = {uuidv4()}>{errorMessage}</p>)) : null}
				<div className = "form-row">
					<div className = "form-cell">
					    <label htmlFor = "register-firstname">
					    	First Name: 
					    </label>
						<input 
						id = "register-firstname"
						type="text"
						{...formRegister("firstName", registerOptions.firstName)}
						/>
				        {errors?.firstName && <small className = "--text-alert">{errors.firstName.message}</small>}
			        </div>
			    </div>
			    <div className = "form-row">
			    	<div className = "form-cell">
					    <label htmlFor = "register-lastname">
					    	Last Name:
					    </label>
						<input 
						id = "register-lastname"
						type="text"
						{...formRegister("lastName", registerOptions.lastName)}
						/>
				        {errors?.lastName && <small className = "--text-alert">{errors.lastName.message}</small>}
			        </div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label htmlFor = "register-email">
					    	Email: 
					    </label>
						<input 
						id = "register-email"
						type="text"
						{...formRegister("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				 	</div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label htmlFor = "register-password">
					    	Password:
					    </label>
						<input 
						id = "register-password"
						type="password"
						{...formRegister("password", registerOptions.password)}
						/>
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
			        </div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label htmlFor = "register-confirm-password">
					    	Confirm Password:
					    </label>
					    <div className = "icon-input">
							<input 
							id = "register-confirm-password"
							type={!showPassword ? "password" : "text"}
							{...formRegister("confirmPassword", registerOptions.confirmPassword)}
							/>
							{
								!showPassword ? 
								<FaEye className = "icon" onClick={() => setShowPassword(!showPassword)}/> : 
								<FaEyeSlash className = "icon" onClick={() => setShowPassword(!showPassword)}/>
							}
						</div>
				        {errors?.confirmPassword && <small className = "--text-alert">{errors.confirmPassword.message}</small>}
			        </div>
			    </div>
			    <div className = "form-row">
				    <div className = "form-cell">
						<button type = "submit">Submit</button>
					</div>
				</div>
				<div className = "form-row">
					<div className = "form-cell">
						<small>Already have an account? Click <a onClick = {() => navigate("/login")}>here</a> to login</small>
					</div>
				</div>
			</form>
		</div>
	)	
}