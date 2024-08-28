import React from "react"
import { Ticket } from "../types/common"
import { colorMap, priorityIconMap, ticketTypeIconMap } from "./Ticket" 
import { CgProfile } from "react-icons/cg"
import { IconContext } from "react-icons"
import { useAppSelector } from "../hooks/redux-hooks"

type Props = {
	ticket: Ticket | undefined
}

export const TicketRow = ({ticket}: Props) => {
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const status = statuses?.find((status) => status.id === ticket?.statusId)
	const ticketType = ticketTypes?.find((ticketType) => ticketType.id === ticket?.ticketTypeId)?.name
	const priority = priorities?.find((priority) => priority.id === ticket?.priorityId)?.name
	return (
		<div className = "tw-p-2 tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-border tw-border-gray-200 tw-rounded-md">
			<div className = "tw-p-1 tw-flex tw-flex-row tw-items-center">
				<div className = "tw-px-1">
					{ticketType && ticketType in ticketTypeIconMap ? (
							ticketTypeIconMap[ticketType]
						) : <></>}
				</div>
				<div className = "tw-px-1"><strong>{ticket?.name}</strong></div>
			</div>
			<div className = "tw-p-1 tw-flex tw-flex-row tw-items-center">
				<div className = "tw-px-1">
					{priority && priority in priorityIconMap ? 
					(
						<IconContext.Provider value = {{color: priority && priority in colorMap ? colorMap[priority] : "", className: "--l-icon"}}>
							{priority && priority in priorityIconMap && (
								<div className = {`--icon-thumb`}>
									{priorityIconMap[priority]}
								</div>)}
						</IconContext.Provider>
					)
					: <></>}	
				</div>
				<div className = "tw-px-1"><CgProfile className = "--l-icon"/></div>
				<div className = "tw-px-1">{status?.name}</div>
			</div>
		</div>
	)
}