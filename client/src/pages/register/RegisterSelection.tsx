import React from "react"
import { Link, Outlet } from "react-router-dom"
import { REGISTER, ORGANIZATION, USER } from "../../helpers/routes"
import { FaBuildingUser } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";

export const RegisterSelection = () => {
	return (
		<div className = "tw-w-full">
			<h1>Would you like to register as: </h1>	
			<div className = "tw-w-full tw-justify-center tw-items-center tw-flex tw-flex-row tw-gap-x-4">
				<Link className = "tw-border tw-p-4 tw-items-center tw-justify-center tw-flex tw-flex-col" to = {`${REGISTER}${USER}`}>
					<FaUser className = "tw-w-16 tw-h-16"/>
					<p>User</p>
				</Link>
				<Link className = "tw-border tw-p-4 tw-items-center tw-justify-center tw-flex tw-flex-col" to = {`${REGISTER}${ORGANIZATION}`}>
					<FaBuildingUser className = "tw-w-16 tw-h-16"/>
					<p>Organization</p>	
				</Link>
			</div>
		</div>	
	)
}