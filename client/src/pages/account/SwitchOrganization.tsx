import React from "react"
import { SwitchOrganizationForm } from "../../components/forms/SwitchOrganizationForm"

export const SwitchOrganization = () => {
	return (
		<div className = "tw-w-1/2 tw-flex tw-flex-col tw-gap-y-2">
			<h1>Switch Organization</h1>
			<SwitchOrganizationForm/>
		</div>
	)
}