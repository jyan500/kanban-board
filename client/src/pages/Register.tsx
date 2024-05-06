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
    		navigate("/login", {state: {"message": "User registered successfully!"}})
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
					    <label>
					    	First Name: 
					    </label>
						<input 
						type="text"
						{...formRegister("firstName", registerOptions.firstName)}
						/>
				        {errors?.firstName && <small className = "--text-alert">{errors.firstName.message}</small>}
			        </div>
			    </div>
			    <div className = "form-row">
			    	<div className = "form-cell">
					    <label>
					    	Last Name:
					    </label>
						<input 
						type="text"
						{...formRegister("lastName", registerOptions.lastName)}
						/>
				        {errors?.lastName && <small className = "--text-alert">{errors.lastName.message}</small>}
			        </div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label>
					    	Email: 
					    </label>
						<input 
						type="text"
						{...formRegister("email", registerOptions.email)}
						/>
				        {errors?.email && <small className = "--text-alert">{errors.email.message}</small>}
				 	</div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label>
					    	Password:
					    </label>
						<input 
						type="password"
						{...formRegister("password", registerOptions.password)}
						/>
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
			        </div>
			    </div>
			    <div className="form-row">
			    	<div className="form-cell">
					    <label>
					    	Confirm Password:
					    </label>
					    <div className = "icon-input">
							<input 
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