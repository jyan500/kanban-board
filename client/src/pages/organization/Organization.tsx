import React from "react"
import { OrganizationForm } from "../../components/OrganizationForm"
import { useAppSelector } from "../../hooks/redux-hooks"
import { useGetOrganizationQuery } from "../../services/private/organization"
import { skipToken } from '@reduxjs/toolkit/query/react'

export const Organization = () => {
	const {userProfile} = useAppSelector((state) => state.userProfile)
	const { data: organization, isLoading} = useGetOrganizationQuery(userProfile?.organizationId ?? skipToken)
	return (
		<div className = "tw-w-full lg:tw-w-1/2">
			<h1>Organization</h1>
			{
				!isLoading && organization ? 
				<OrganizationForm organization={organization}/> : null
			}
		</div>		
	)	
}
