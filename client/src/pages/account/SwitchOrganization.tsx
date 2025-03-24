import React from "react"
import { SwitchOrganizationForm } from "../../components/forms/SwitchOrganizationForm"
import { useAppSelector } from "../../hooks/redux-hooks"
import { Navigate } from "react-router-dom"

export const SwitchOrganization = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	return (
		!userProfile?.isActive ? (
			<Navigate replace to = {"/"} state={{type: "failure", alert: "You don't have permission to access this page"}}/>
		) : (
			<div className = "tw-w-1/2 tw-flex tw-flex-col tw-gap-y-2">
				<h1>Switch Organization</h1>
				<SwitchOrganizationForm/>
			</div>
		)

	)
}
