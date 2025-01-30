import React from "react"
import { Link, Outlet } from "react-router-dom"
import { REGISTER, ORGANIZATION, USER } from "../../helpers/routes"

export const RegisterSelection = () => {
	return (
		<div>
			<p>Please choose your selection</p>	
			<div className = "tw-flex tw-flex-row tw-gap-y-4">
				<Link to = {`${REGISTER}${USER}`}>User</Link>
				<Link to = {`${REGISTER}${ORGANIZATION}`}>Organization</Link>
			</div>
		</div>	
	)
}