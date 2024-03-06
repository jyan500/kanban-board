import React from "react"
import "../styles/common.css"
import "../styles/ticket.css"
import type { Ticket as TicketType } from "../types/common"

type PropType = {
	ticket: TicketType
}

export const Ticket = ({ticket}: PropType) => {
	return (
		<div className = "ticket-card">
			<div>
				<p>id: {ticket.id} </p>
				<p>Ticket: {ticket.ticketName}</p>	
				<p>Status: {ticket.ticketStatus.name}</p>	
				<p>Priority: {ticket.priority.name}</p>	
			</div>
		</div>
	)	
}