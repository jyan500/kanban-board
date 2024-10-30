import React, {useRef} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TICKET_URL } from "../../helpers/urls" 

export const AddToEpicFormModal = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
	const handleSelect = (selectedOption: {label: string, value: string} | null) => {
		if (selectedOption){

		}
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<p>Add To Epic</p>		
			<AsyncSelect endpoint={TICKET_URL} urlParams={{searchBy: "title", ticketType: epicTicketType?.id}} onSelect={handleSelect}/>
		</div>
	)		
}