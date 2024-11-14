import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { EditTicketForm } from "../EditTicketForm"
import { Ticket } from "../../types/common"

export const EditTicketFormModal = () => {
	const {
		tickets,
		currentTicketId,
		statusesToDisplay,
		boardInfo,
	} = useAppSelector((state) => state.board)

	return (
		<EditTicketForm boardId={boardInfo?.id} isModal={true} ticket={tickets.find((ticket: Ticket) => ticket.id === currentTicketId)} statusesToDisplay={statusesToDisplay}/>
	)	
}