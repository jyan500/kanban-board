import React from "react"
import { RegistrationRequestStatus } from "../../types/common"
import { Badge } from "./Badge"

interface Props {
	status: RegistrationRequestStatus
}

export const RegistrationRequestStatusBadge = ({status}: Props) => {

	const getColor = () => {
		switch (status){
			case "Pending":
				return "tw-bg-secondary"
			case "Approved":
				return "tw-bg-success"
			case "Denied":
				return "tw-bg-danger"
		}
	}

	return (
		<Badge className = {`tw-text-white ${getColor()}`}><span>{status}</span></Badge>
	)
}
