import React from "react"
import { EditTicketForm } from "../../components/EditTicketForm"
import { useAppSelector } from "../../hooks/redux-hooks"
import { useGetTicketQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { useParams } from "react-router-dom"

export const Ticket = () => {
	const params = useParams<{ticketId: string}>()
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const { data: ticket, isFetching} = useGetTicketQuery(ticketId ?? skipToken)
	const { statuses } = useAppSelector((state) => state.status)
	return (
		isFetching ? <LoadingSpinner/> : 
		<EditTicketForm ticket={ticket?.[0]} statusesToDisplay={statuses}/>
	)	
}