import React, {useState} from "react"
import { Link } from "react-router-dom"
import { ListResponse, Ticket } from "../../types/common"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TicketRow } from "../TicketRow"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../page-elements/PaginationRow"

type Props = {
	title: string
	tickets: ListResponse<Ticket>
	setFilterBy: (filterById: number | undefined) => void
	setPage: (page: number) => void
}

export const TicketsContainer = ({title, tickets, setFilterBy, setPage}: Props) => {
	const [isActive, setIsActive] = useState<number>(0)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	return (
		<div className = "tw-p-4 tw-w-full tw-flex tw-flex-col tw-gap-y-2 tw-border tw-border-gray-50 tw-shadow-sm">
			{/* Top */}
			<div className = "tw-p-4">
				<h1>{title}</h1>
			</div>	
			{/* Middle selection area */}
			<div className = "tw-p-4 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-100">
				<button className = {`${isActive === 0 ? "tw-text-primary tw-font-bold" : ""}`} onClick={(e) => {
					setFilterBy(undefined)
					setIsActive(0)
				}}>
					All
				</button>
				{ticketTypes.map((ticketType) => (
					<button className = {`${isActive === ticketType.id ? "tw-text-primary tw-font-bold" : ""}`} onClick={(e) => {
						setFilterBy(ticketType.id)
						setIsActive(ticketType.id)
					}
					}>{ticketType.name}</button>
				))}
			</div>	
			<div className = "tw-p-4 tw-flex tw-flex-col tw-gap-y-2">
				<div className = "tw-flex tw-flex-row tw-justify-between">
					<p><span className = "tw-font-bold">Total:</span> {tickets.pagination.total}</p>
					<PaginationRow setPage={setPage} showPageNums={false} paginationData={tickets.pagination}/>
				</div>
				<>
					{tickets.data.map((ticket: Ticket) => {
						return (
							<Link key={`${title}_${ticket.id}`} to={`${TICKETS}/${ticket.id}`}>
								<TicketRow 
									key={`${title}_ticket_${ticket.id}`} 
									ticket={ticket}
									borderless={true}
								/>
							</Link>
						)
					})}
				</>
			</div>	
		</div>
	)
}