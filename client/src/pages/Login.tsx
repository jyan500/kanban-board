import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { setCredentials } from "../slices/authSlice" 
import { useLoginMutation } from "../services/public/auth" 
import {v4 as uuidv4} from "uuid"
import { useLocation, useNavigate, Link } from "react-router-dom" 
import { useForm } from "react-hook-form"
import { parseErrorResponse } from "../helpers/functions"
import { useGetOrganizationQuery } from "../services/public/organization" 
import { REGISTER } from "../helpers/routes"

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
	const {data: orgData} = useGetOrganizationQuery()
	const { token } = useAppSelector((state) => state.auth)
	const { register , handleSubmit, formState: {errors} } = useForm<FormValues>()
	const registerOptions = {
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    organizationId: { required: "Organization is required"},
    }
    useEffect(() => {
    	// 
    	if (token){
    		navigate("/", {replace: true})
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
				{error && "status" in error ? (error.data.errors?.map((errorMessage) => <p className = "--text-alert" key = {uuidv4()}>{errorMessage}</p>)) : null}
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
						<input 
						id="login-password"
						type="password"
						className = "tw-w-full"
						{...register("password", registerOptions.password)}
						/>
				        {errors?.password && <small className = "--text-alert">{errors.password.message}</small>}
				    </div>
				</div>
				<div>
				    <div>
					    <label className = "label" htmlFor = "login-organization">
					    	Organization:
					    </label>
						<select 
							className = "tw-w-full"
							id = "login-organization"
							{...register("organizationId", registerOptions.organizationId)}
						>
							<option value = "">---</option>
							{ orgData?.map((org) => <option key = {org.id} value = {org.id}>{org.name}</option>)
							}
						</select>
				        {errors?.organizationId && <small className = "--text-alert">{errors.organizationId.message}</small>}
				    </div>
				</div>
				<div>
				    <div>
						<button className = "button" type = "submit">Submit</button>
					</div>
				</div>
				<div>
					<div>
						<small>Don't have an account? Click <Link className = "tw-text-sky-500" to={REGISTER}>Here</Link> to Register</small>
					</div>
				</div>
			</form>
		</div>
	)	
}