import React, { useState } from "react"
import { useGetTicketsQuery } from "../../services/private/ticket" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Ticket } from "../../types/common"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TicketRow } from "../../components/TicketRow"

export const TicketDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const params = useParams<{ticketId: string}>()
	const navigate = useNavigate()
	const {data: data, isFetching } = useGetTicketsQuery({page: searchParams.get("page") ?? 1})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`

	const setPage = (pageNum: number) => {
		const pageUrl = `${TICKETS}${ticketId ? `/${ticketId}` : ""}?page=${pageNum}`
	    navigate(pageUrl, {replace:true});
	}

	const showTicket = (id: number) => {
		const pageUrl = `${TICKETS}/${id}?page=${searchParams.get("page") ?? 1}`
		navigate(pageUrl)
	}

	return (
		<>
			<h1>Tickets Backlog</h1>
			{isFetching ? <LoadingSpinner/> : (
				<div className = "tw-flex tw-flex-row tw-gap-x-4">
					<div className = "tw-w-1/4 tw-flex tw-flex-col tw-gap-y-4">
						<div className = "tw-p-4 tw-border tw-border-gray-300 tw-rounded-lg">
							<PaginationRow
								showPageNums={false}
								currentPage={searchParams.get("page") ? Number(searchParams.get("page")) : 1}
								paginationData={data?.pagination}
								setPage={setPage}
							/>
						</div>
						{data?.data?.map((ticket: Ticket) => {
							return (
								<button className = "hover:tw-gray-50" onClick={() => showTicket(ticket.id)}>
									<TicketRow ticket={ticket}/>
								</button>
							)
						})}
					
					</div>
					<div className = "tw-w-3/4 tw-flex tw-flex-col tw-gap-y-4">
						<Outlet/>
					</div>
				</div>
			)}
		</>
	)	
}