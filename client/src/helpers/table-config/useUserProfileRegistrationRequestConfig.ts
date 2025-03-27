import React, {useState} from "react"
import { dateModifier } from "../table-modifiers/display-modifiers"
import { RegistrationRequestStatusBadge } from "../../components/page-elements/RegistrationRequestStatusBadge"

export type userProfileRegistrationRequestConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>,
	renderers: Record<string, any>
}

export const useUserProfileRegistrationRequestConfig = () => {
	return {
		headers: {
			"organizationName": "Organization",
			"createdAt": "Registration Date",
			"status": "Status"
		},
		renderers: {
			"status": (status: string) => {
				return {
					component: RegistrationRequestStatusBadge,
					props: {
						status
					}
				}
			}
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, lookup: []},
		},
	}
}
