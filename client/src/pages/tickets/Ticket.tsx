import React from "react"
import { EditTicketForm } from "../../components/EditTicketForm"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useGetTicketQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useParams } from "react-router-dom"
import { Banner } from "../../components/page-elements/Banner"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { TicketFormPlaceholder } from "../../components/placeholders/TicketFormPlaceholder"

export const Ticket = () => {
	const params = useParams<{ticketId: string}>()
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const dispatch = useAppDispatch()
	const { data: ticket, isLoading, isError} = useGetTicketQuery(ticketId ?? skipToken)
	const { statuses } = useAppSelector((state) => state.status)
	if (!isLoading && isError){
		return (
			<Banner message = {"Something went wrong!"} type = "failure"/>
		)
	}
	return (
		isLoading ? 
		<LoadingSkeleton height="tw-h-[500px]" width="tw-w-full">
			<TicketFormPlaceholder/>	
		</LoadingSkeleton> : 
		<EditTicketForm ticket={ticket?.[0]} statusesToDisplay={statuses}/>
	)	
}
