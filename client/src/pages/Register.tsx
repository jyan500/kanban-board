import React from "react"
import { RegisterUserForm } from "../components/forms/RegisterUserForm"
import { ArrowButton } from "../components/page-elements/ArrowButton"
import { useNavigate } from "react-router-dom"

export const Register = () => {
	const navigate = useNavigate()
	return (
		<div className = "tw-w-full">
			<ArrowButton text="Back" onClick={() => navigate(-1)}/>
			<div><h1>Register</h1></div>
			<RegisterUserForm/>
		</div>	
	)	
}
