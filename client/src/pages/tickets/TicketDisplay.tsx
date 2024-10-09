import React, { useState } from "react"
import { useGetTicketsQuery } from "../../services/private/ticket" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Ticket } from "../../types/common"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TicketRow } from "../../components/TicketRow"
import { SearchToolBar } from "../../components/tickets/SearchToolBar"

export const TicketDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const params = useParams<{ticketId: string}>()
	const navigate = useNavigate()
	const {data: data, isFetching } = useGetTicketsQuery({page: searchParams.get("page") ?? 1})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`

	const setPage = (pageNum: number) => {
		const pageUrl = `${TICKETS}${ticketId ? `/${ticketId}` : ""}?page=${pageNum}`
	    navigate(pageUrl, {replace:true});
	}

	const showTicket = (id: number) => {
		const pageUrl = `${TICKETS}/${id}?page=${currentPage}`
		navigate(pageUrl)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<h1>Tickets Backlog</h1>
			<SearchToolBar 
				paginationData={data?.pagination} 
				setPage={setPage} 
				currentPage={currentPage ?? 1}
			/>
			{isFetching ? <LoadingSpinner/> : (
				<div className = "tw-flex tw-flex-row tw-gap-x-6">
					<div className = "tw-w-1/3 tw-flex tw-flex-col tw-gap-y-4">
						
						{data?.data?.map((ticket: Ticket) => {
							return (
								<button className = "hover:tw-gray-50" onClick={() => showTicket(ticket.id)}>
									<TicketRow ticket={ticket}/>
								</button>
							)
						})}
					</div>
					<div className = "tw-w-2/3 tw-flex tw-flex-col tw-gap-y-4">
						<Outlet/>
					</div>
				</div>
			)}
		</div>
	)	
}