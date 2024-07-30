import React, {ReactNode} from "react"
import "../styles/ticket.css"
import type { Ticket as TicketType } from "../types/common"
import { useAppSelector } from "../hooks/redux-hooks"
import { IoReorderTwoOutline as MediumPriorityIcon } from "react-icons/io5";
import { HiChevronDoubleUp as HighPriorityIcon } from "react-icons/hi2";
import { HiChevronDown as LowPriorityIcon } from "react-icons/hi2";
import { IconContext } from "react-icons"
import { BugIcon } from "../assets/icons/BugIcon"
import { ModificationIcon } from "../assets/icons/ModificationIcon"
import { FeatureIcon } from "../assets/icons/FeatureIcon"
import { CgProfile } from "react-icons/cg";

type PropType = {
	ticket: TicketType
}

export const Ticket = ({ticket}: PropType) => {
	const {priorities} = useAppSelector((state) => state.priority)
	const {statuses} = useAppSelector((state) => state.status)
	const {ticketTypes} = useAppSelector((state) => state.ticketType)

	const priorityIconMap: {[key: string]: ReactNode} = {
		"Low": <LowPriorityIcon/>,	
		"Medium": <MediumPriorityIcon/>,
		"High": <HighPriorityIcon/>,
	}

	const ticketTypeIconMap: {[key: string]: ReactNode} = {
		"Feature": <FeatureIcon className="icon"/>,
		"Modification": <ModificationIcon className="icon"/>,
		"Bug": <BugIcon className="icon"/>,
	}

	const colorMap: {[key: string]: string} = {
		"Low": "var(--bs-primary)",
		"Medium": "var(--bs-warning)",
		"High": "var(--bs-danger)"	
	}

	const priority = priorities.find((p) => p.id === ticket.priorityId)?.name
	const ticketType = ticketTypes.find((t) => t.id === ticket.ticketTypeId)?.name
	return (
		<div className = "ticket-card --card-shadow">
			<div>
				<div className = "__header">
					<span className = "--m-text">{ticket.name}</span>
					<CgProfile className="--l-icon"/>
				</div>
				<div className = "__row">
					{ticket.description}	
				</div>
				<div className = "__row __icon">
					{ticketType && ticketType in ticketTypeIconMap ? (
						ticketTypeIconMap[ticketType]
					) : <></>}
					{priority && priority in priorityIconMap ? 
					(
						<IconContext.Provider value = {{color: priority && priority in colorMap ? colorMap[priority] : "", className: "icon"}}>
							{priority && priority in priorityIconMap && (
								<div className = {`--icon-thumb`}>
									{priorityIconMap[priority]}
								</div>)}
						</IconContext.Provider>
					)
					: <></>}
				</div>
			</div>
		</div>
	)	
}