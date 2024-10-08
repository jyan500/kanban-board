import React, { useState } from "react"
import { useGetTicketsQuery } from "../../services/private/ticket" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Ticket } from "../../types/common"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"

export const TicketDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const {data: data, isFetching } = useGetTicketsQuery({page: searchParams.get("page") ?? 1})

	const setPage = (pageNum: number) => {
		const pageUrl = `${TICKETS}?page=${pageNum}`
	    navigate(pageUrl, {replace:true});
	}

	return (
		<>
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
						<div>{ticket.name}</div>
					)
				})}
			
			</div>
			<div className = "tw-w-3/4 tw-flex tw-flex-col tw-gap-y-4">
			</div>
		</>
	)	
}