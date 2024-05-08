import React from "react"
import "../styles/ticket.css"
import type { Ticket as TicketType } from "../types/common"
import { useAppSelector } from "../hooks/redux-hooks"

type PropType = {
	ticket: TicketType
}

export const Ticket = ({ticket}: PropType) => {
	const {priorities} = useAppSelector((state) => state.priority)
	const {statuses} = useAppSelector((state) => state.status)
	return (
		<div className = "ticket-card --card-shadow">
			<div>
				<h3>{ticket.name}</h3>	
				<p>Status: {statuses.find((s) => s.id === ticket.statusId)?.name}</p>	
				<p>Priority: {priorities.find((p) => p.id === ticket.priorityId)?.name}</p>	
			</div>
		</div>
	)	
}