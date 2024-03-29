import React from "react"
import "../styles/ticket.css"
import type { Ticket as TicketType } from "../types/common"

type PropType = {
	ticket: TicketType
}

export const Ticket = ({ticket}: PropType) => {
	return (
		<div className = "ticket-card --card-shadow">
			<div>
				<h3>{ticket.name}</h3>	
				<p>Status: {ticket.status.name}</p>	
				<p>Priority: {ticket.priority.name}</p>	
			</div>
		</div>
	)	
}