import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { AddTicketForm } from "../AddTicketForm"
import { Ticket, Status } from "../../types/common"

type Props = {
	statusesToDisplay?: Array<Status>
	ticket?: Ticket | null | undefined
	boardId?: number | null | undefined
	dueDate?: string | null | undefined
	sprintId?: number | null | undefined
	statusId?: number | null | undefined
}

export const AddTicketFormModal = ({boardId, ticket, statusesToDisplay, statusId, sprintId, dueDate}: Props) => {
	return (
		<AddTicketForm sprintId={sprintId} boardId={boardId} ticket={ticket} statusesToDisplay={statusesToDisplay} statusId={statusId} dueDate={dueDate}/>
	)	
}
