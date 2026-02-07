import React from "react"
import { Link, Outlet } from "react-router-dom"
import { REGISTER, ORGANIZATION, USER } from "../../helpers/routes"
import { IconBuildingUser } from "../../components/icons/IconBuildingUser";
import { IconUser } from "../../components/icons/IconUser";

export const RegisterSelection = () => {
	return (
		<div className = "tw-h-full tw-w-full tw-justify-center tw-items-center tw-flex tw-flex-col">
			<h2>Would you like to:</h2>	
			<div className = "tw-flex tw-flex-row tw-gap-x-4">
				<Link className = "tw-text-center hover:tw-opacity-60 tw-p-8 tw-gap-y-4 tw-items-center tw-justify-center tw-flex tw-flex-col" to = {`${REGISTER}${USER}`}>
					<IconUser className = "tw-w-24 tw-h-24"/>
					<p className = "tw-font-medium">Join Existing Organization</p>
				</Link>
				<Link className = "tw-text-center hover:tw-opacity-60 tw-p-8 tw-gap-y-4 tw-items-center tw-justify-center tw-flex tw-flex-col" to = {`${REGISTER}${ORGANIZATION}`}>
					<IconBuildingUser className = "tw-w-24 tw-h-24"/>
					<p className = "tw-font-medium">Register New Account</p>	
				</Link>
			</div>
		</div>	
	)
}
