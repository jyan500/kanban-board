import React, {useState} from "react"
import { Link } from "react-router-dom"
import { ListResponse, Ticket } from "../../types/common"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TicketRow } from "../TicketRow"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../page-elements/PaginationRow"
import { FilterButton } from "../page-elements/FilterButton"

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
		<div className = "tw-w-full tw-flex tw-flex-col">
			{/* Top */}
			<h3>{title}</h3>
			{/* Middle selection area */}
			<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-200">
				<FilterButton isActive={isActive === 0} onClick={(e) => {
					setFilterBy(undefined)
					setIsActive(0)
				}}>
					All
				</FilterButton>
				{ticketTypes.map((ticketType) => (
					<FilterButton isActive={isActive === ticketType.id} onClick={(e) => {
						setFilterBy(ticketType.id)
						setIsActive(ticketType.id)
					}}>
					{ticketType.name}
					</FilterButton>
				))}
			</div>	
			<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-col">
				<div className = "tw-flex tw-flex-row tw-justify-between">
					<p><span className = "tw-font-bold">Total:</span> {tickets.pagination.total}</p>
					{
						tickets.pagination.nextPage || tickets.pagination.prevPage ? 
							<PaginationRow setPage={setPage} showPageNums={false} paginationData={tickets.pagination}/>
						: null
					}
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