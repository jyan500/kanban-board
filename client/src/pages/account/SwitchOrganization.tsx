import React, {useState, useEffect} from "react"
import { SwitchOrganizationForm } from "../../components/forms/SwitchOrganizationForm"
import { useAppSelector } from "../../hooks/redux-hooks"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { PRIMARY_TEXT } from "../../helpers/constants"

export const SwitchOrganization = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)

	return (
		<div className = "tw-w-1/2 tw-flex tw-flex-col tw-gap-y-2">
			<h1 className={PRIMARY_TEXT}>Switch Organization</h1>
			<SwitchOrganizationForm/>
		</div>
	)
}
