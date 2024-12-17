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
import { EpicIcon } from "../assets/icons/EpicIcon"
import { CgProfile } from "react-icons/cg";
import { Badge } from "./page-elements/Badge"
import { TICKETS } from "../helpers/routes"
import { Link } from "react-router-dom"
import { Avatar } from "./page-elements/Avatar"
import { useGetUserQuery } from "../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "./LoadingSpinner"

export const priorityIconMap: {[key: string]: ReactNode} = {
	"Low": <LowPriorityIcon/>,	
	"Medium": <MediumPriorityIcon/>,
	"High": <HighPriorityIcon/>,
}

type TicketTypeIconProps = {
	type: string	
	className?: string
}

export const TicketTypeIcon = ({type, className}: TicketTypeIconProps) => {
	const defaultClass = className ?? "tw-w-6 tw-h-6 tw-shrink-0"
	switch (type) {
		case "Feature":
			return <FeatureIcon className={defaultClass}/>
		case "Modification":
			return <ModificationIcon className={defaultClass}/>
		case "Bug":
			return <BugIcon className={defaultClass}/>
		case "Epic":
			return <EpicIcon className={defaultClass}/>
	}
	return <div></div>
}


export const colorMap: {[key: string]: string} = {
	"Low": "var(--bs-primary)",
	"Medium": "var(--bs-warning)",
	"High": "var(--bs-danger)"	
}

type PropType = {
	ticket: TicketType
}

export const Ticket = ({ticket}: PropType) => {
	const {priorities} = useAppSelector((state) => state.priority)
	const {statuses} = useAppSelector((state) => state.status)
	const {ticketTypes} = useAppSelector((state) => state.ticketType)
	const { data, isFetching } = useGetUserQuery(ticket?.userId ?? skipToken)

	const priority = priorities.find((p) => p.id === ticket.priorityId)?.name
	const ticketType = ticketTypes.find((t) => t.id === ticket.ticketTypeId)?.name
	return (
		<div className = "tw-w-full tw-h-full tw-flex tw-flex-col tw-items-start tw-bg-white tw-rounded-md tw-shadow-md hover:tw-bg-gray-50 tw-p-2 tw-gap-y-2">
			<div className = "tw-w-full tw-flex tw-flex-row tw-justify-between tw-gap-x-1">
				<span className = "tw-font-bold">{ticket.name}</span>
				{/*<CgProfile className="tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6"/>*/}
				{isFetching ? <CgProfile className = "tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6"/> : <Avatar imageUrl={data?.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/>}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				{
					ticket.epicParentTickets?.map((parentTicket) => 
						<Link key={`epic_parent_link_${parentTicket.id}`} onClick={(e) => {
							e.stopPropagation()
						}} to={`${TICKETS}/${parentTicket.id}`}>
							<Badge key = {`epic_parent_${parentTicket.id}`} className = {"tw-bg-light-purple tw-text-white"}><span className = "tw-text-sm">{parentTicket.name}</span></Badge>
						</Link>
					)
				}
			</div>
			<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
				{ticketType ? (
					<TicketTypeIcon type = {ticketType} className = {"tw-shrink-0 tw-w-5 tw-h-5"}/>
				) : <></>}
				{priority && priority in priorityIconMap ? 
				(
					<IconContext.Provider value = {{color: priority && priority in colorMap ? colorMap[priority] : "", className: "tw-shrink-0 tw-w-5 tw-h-5"}}>
						{priority && priority in priorityIconMap && (
							<>
								{priorityIconMap[priority]}
							</>)}
					</IconContext.Provider>
				)
				: <></>}
			</div>
		</div>
	)	
}