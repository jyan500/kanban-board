import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { AddTicketForm } from "../AddTicketForm"
import { Ticket } from "../../types/common"

export const AddTicketFormModal = () => {
	const {
		tickets,
		currentTicketId,
		statusesToDisplay,
		boardInfo,
	} = useAppSelector((state) => state.board)

	return (
		<AddTicketForm boardId={boardInfo?.id} ticket={tickets.find((ticket: Ticket) => ticket.id === currentTicketId)} statusesToDisplay={statusesToDisplay}/>
	)	
}
