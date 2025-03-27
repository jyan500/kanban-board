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
import { LoadingButton } from "../../components/page-elements/LoadingButton"
import { PasswordRules } from "../../components/page-elements/PasswordRules"

export type FormValues = {
	firstName: string
	lastName: string
	email: string
	password: string
	confirmPassword: string
}

type UserFormValues = FormValues & {
	organizationId: number
}

type Props = {
	isOrgRegister?: boolean
	onSubmit?: (values: FormValues) => void
	user?: FormValues | undefined
}

export const RegisterUserForm = ({isOrgRegister, onSubmit: propSubmit, user}: Props) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { control, register: formRegister, reset, watch, handleSubmit, setValue, formState: {errors} } = useForm<UserFormValues>()
	const [ userRegister, { isLoading, error }] = useUserRegisterMutation()
	const [showPassword, setShowPassword] = useState(false)

	const defaultForm: UserFormValues = {
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		organizationId: 0
	}

	const registerOptions = {
		firstName: { required: "First Name is required"},
		lastName: { required: "Last Name is required"},
	    email: { required: "Email is required" },
	    password: { required: "Password is required"},
	    confirmPassword: { required: "Confirm Password is required"},
	    ...(!isOrgRegister ? {organizationId: { required: "Organization is required"}} : {}),
    }

    useEffect(() => {
    	if (user && Object.keys(user).length > 0){
    		reset(user)
    	}
    	else {
    		reset(defaultForm)
    	}
    }, [user])

	const onSubmit = async (values: UserFormValues) => {
		try {
			const data = await userRegister(values).unwrap()
    		navigate(LOGIN, {state: {"alert": "User registered successfully!"}, replace: true})
		}
		catch (err) {
			console.log(err)
		}
	}

	return (
		<div className = "tw-w-full">
			<form className = "tw-flex tw-flex-col tw-gap-y-4" onSubmit={handleSubmit(propSubmit ?? onSubmit)}>
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
			    {
			    	!propSubmit ? (
				        <div>
						    <label className = "label" htmlFor = "register-organization">
						    	Organization: <span className = "tw-font-bold tw-text-red-500">*</span>
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
		    		) : null
			    }
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
						<PasswordRules password={watch("password") ?? ""}/>
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
			    	<LoadingButton className = "button" type = "submit" text = "Submit"/>
				</div>
				{
					!isOrgRegister ? ( 
						<div>
							<div>
								<small>Already have an account? Click <Link className = "hover:tw-opacity-1 tw-text-sky-500" to={"/login"}>Here</Link> to login</small>
							</div>
						</div>
					) : null
				}
			</form>
		</div>	
	)	
}
