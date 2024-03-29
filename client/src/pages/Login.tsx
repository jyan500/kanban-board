import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { setCredentials } from "../slices/authSlice" 
import { useLoginMutation } from "../services/auth" 
import {v4 as uuidv4} from "uuid"
import { useLocation, useNavigate } from "react-router-dom" 
import { useForm, Resolver } from "react-hook-form"
import { parseErrorResponse } from "../helpers/functions"

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
	const { token } = useAppSelector((state) => state.auth)
	const org = useAppSelector((state) => state.org)
	const { register , handleSubmit, formState: {errors} } = useForm<FormValues>()
	const registerOptions = {
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    organizationId: { required: "Organization is required"},
    }
    useEffect(() => {
    	// 
    	if (token){
    		navigate("/")
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
		<div className = "container">
			{/* checking if "status" in error narrows down the type to the CustomError defined in services/auth.ts,
			 rather than SerializedError Type */}
			<form className = "form-container" onSubmit={handleSubmit(onSubmit)}>
				<div><h1>Login</h1></div>
				{error && "status" in error ? (error.data.errors?.map((errorMessage) => <p key = {uuidv4()}>{errorMessage}</p>)) : null}
				{location.state?.message ? <p>{location.state.message}</p> : null}
				<div className = "form-row">
					<div className = "form-cell">
					    <label>
					    	Email: 
					    </label>
						<input 
						{...register("email", registerOptions.email)}
						/>
				        {errors?.email && <small>{errors.email.message}</small>}
				    </div>
				</div>
				<div className = "form-row">
				    <div className = "form-cell">
					    <label>
					    	Password:
					    </label>
						<input 
						type="password"
						{...register("password", registerOptions.password)}
						/>
				        {errors?.password && <small>{errors.password.message}</small>}
				    </div>
				</div>
				<div className = "form-row">
				    <div className = "form-cell">
					    <label>
					    	Organization:
					    </label>
						<select 
							{...register("organizationId", registerOptions.organizationId)}
						>
							{ org.organizations?.map((org) => <option key = {org.id} value = {org.id}>{org.name}</option>)
							}
						</select>
				        {errors?.organizationId && <small>{errors.organizationId.message}</small>}
				    </div>
				</div>
				<div className = "form-row">
				    <div className = "form-cell">
						<button type = "submit">Submit</button>
					</div>
				</div>
				<div className = "form-row">
					<div className = "form-cell">
						<small>Don't have an account? Click <button className = "--transparent" onClick={() => navigate("/register")}>Here</button> to Register</small>
					</div>
				</div>
			</form>
		</div>
	)	
}