import React, {useState} from "react"
import { Ticket } from "../types/common"
import { colorMap, priorityIconMap, TicketTypeIcon } from "./Ticket" 
import { CgProfile } from "react-icons/cg"
import { IconContext } from "react-icons"
import { useAppSelector } from "../hooks/redux-hooks"
import { TfiUnlink as Unlink } from "react-icons/tfi";
import { IconButton } from "./page-elements/IconButton"

type Props = {
	ticket: Ticket | undefined
	ticketRelationshipId?: number
	showUnlink?: boolean
	onUnlink?: (ticketId: number | undefined, ticketRelationshipId: number) => void
}

export const TicketRow = ({ticket, ticketRelationshipId, showUnlink, onUnlink}: Props) => {
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const status = statuses?.find((status) => status.id === ticket?.statusId)
	const ticketType = ticketTypes?.find((ticketType) => ticketType.id === ticket?.ticketTypeId)?.name
	const priority = priorities?.find((priority) => priority.id === ticket?.priorityId)?.name
	const [showConfirmUnlink, setShowConfirmUnlink] = useState(false)
	return (
		<div className = "hover:tw-bg-gray-50 tw-p-2 tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-border tw-border-gray-200 tw-rounded-md tw-group">
			<div className = "tw-w-3/5 tw-p-1 tw-flex tw-flex-row tw-items-center tw-gap-x-4">
				<div>
					{ticketType ? (
							<TicketTypeIcon type={ticketType} />	
						) : <></>}
				</div>
				<div className = "tw-text-left tw-break-words"><strong>{ticket?.name}</strong></div>
			</div>
			<div className = "tw-w-1/5 tw-p-1 tw-flex tw-flex-row tw-justify-start tw-items-center tw-gap-x-2">
				<div>
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
				<div><CgProfile className = "--l-icon"/></div>
				<div className = "tw-text-left tw-break-words">{status?.name}</div>
			</div>
			<div className = "tw-w-1/5 tw-flex tw-flex-row tw-justify-end">
				{
					showUnlink && onUnlink && ticketRelationshipId ? (
						<IconButton className = "group-hover:tw-visible tw-invisible" onClick={(e) => {
							// prevent click on this component from triggering an onclick of the parent component
							e.stopPropagation()
							e.preventDefault()
							onUnlink(ticket?.id, ticketRelationshipId)
						}}>
							<Unlink className = "tw-w-6 tw-h-6 tw-shrink-0"/>	
						</IconButton>
					) : null
				}	
			</div>
		</div>
	)
}