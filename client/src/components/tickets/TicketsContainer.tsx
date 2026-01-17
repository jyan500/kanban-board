import React, {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import { ListResponse, Ticket } from "../../types/common"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TicketRow } from "../TicketRow"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../page-elements/PaginationRow"
import { TabButton } from "../page-elements/TabButton"
import { IconArrowDown } from "../icons/IconArrowDown"
import { IconArrowUp } from "../icons/IconArrowUp"
import { Button } from "../page-elements/Button"

type Props = {
	title: string
	tickets: ListResponse<Ticket>
	setFilterBy: (filterById: number | undefined) => void
	setPage: (page: number) => void
	triggerSort: (sortAttribute: string, sortDirection: string, title: string) => void
}

export const TicketsContainer = ({title, tickets, setFilterBy, setPage, triggerSort}: Props) => {
	const [isActive, setIsActive] = useState<number>(0)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const [sortAttribute, setSortAttribute] = useState("dueDate")
	const [sortDirection, setSortDirection] = useState("desc")

	useEffect(() => {
		triggerSort(sortAttribute, sortDirection, title)
	}, [sortAttribute, sortDirection])

	return (
		<div className = "tw-w-full tw-flex tw-flex-col">
			{/* Top */}
			<h3>{title}</h3>
			{/* Middle selection area */}
			<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-200">
				<TabButton isActive={isActive === 0} onClick={(e) => {
					setFilterBy(undefined)
					setIsActive(0)
				}}>
					All
				</TabButton>
				{ticketTypes.map((ticketType) => (
					<TabButton 
						key={`filter_button_${ticketType.id}`}
						isActive={isActive === ticketType.id} onClick={(e) => {
						setFilterBy(ticketType.id)
						setIsActive(ticketType.id)
					}}>
					{ticketType.name}
					</TabButton>
				))}
			</div>	
			<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-col tw-gap-y-2">
				<div className = "tw-flex tw-flex-row tw-justify-between">
					<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
						<span className = "tw-text-gray-500">Total:</span> {tickets.pagination.total}
						<select onChange={(e) => {
							setSortAttribute(e.target.value)
						}} value={sortAttribute}>
							<option value={"dueDate"}>Due Date</option>
							<option value={"createdAt"}>Created At</option>
							<option value={"name"}>Name</option>
						</select>
						<Button onClick={(e) => {
							setSortDirection(sortDirection === "desc" ? "asc": "desc")
						}}>{sortDirection === "desc" ? <IconArrowDown/> : <IconArrowUp/>}</Button>
					</div>
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
									showDueBadge={true}
								/>
							</Link>
						)
					})}
				</>
			</div>	
		</div>
	)
}