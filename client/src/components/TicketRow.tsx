import React, {useState} from "react"
import { Ticket } from "../types/common"
import { priorityIconMap, PriorityIcon, TicketTypeIcon } from "./Ticket" 
import { LG_BREAKPOINT, PRIMARY_TEXT, PRIORITY_COLOR_MAP, STANDARD_BORDER } from "../helpers/constants"
import { CgProfile } from "react-icons/cg"
import { IconContext } from "react-icons"
import { useAppSelector } from "../hooks/redux-hooks"
import { TfiUnlink as Unlink } from "react-icons/tfi";
import { IconButton } from "./page-elements/IconButton"
import { useGetUserQuery } from "../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Avatar } from "./page-elements/Avatar"
import { useScreenSize } from "../hooks/useScreenSize"
import { SM_BREAKPOINT } from "../helpers/constants"
import { getUserInitials } from "../helpers/functions"
import { LoadingSpinner } from "./LoadingSpinner"
import { isSameWeek, isAfter, parseISO, format } from "date-fns"
import { IconWarning } from "./icons/IconWarning"
import { STANDARD_HOVER } from "../helpers/constants"
import { HoverTooltip } from "./page-elements/HoverTooltip"

type Props = {
	ticket: Ticket | undefined
	ticketRelationshipId?: number
	showUnlink?: boolean
	onUnlink?: (ticketId: number | undefined, ticketRelationshipId: number) => void
	borderless?: boolean
	hideProfilePicture?: boolean
	showDueBadge?: boolean
	isLoadingState?: boolean
}

export const TicketRow = ({ticket, ticketRelationshipId, showUnlink, onUnlink, borderless, hideProfilePicture, isLoadingState, showDueBadge}: Props) => {
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const status = statuses?.find((status) => status.id === ticket?.statusId)
	const ticketType = ticketTypes?.find((ticketType) => ticketType.id === ticket?.ticketTypeId)?.name
	const priority = priorities?.find((priority) => priority.id === ticket?.priorityId)?.name
	const [showConfirmUnlink, setShowConfirmUnlink] = useState(false)
	const { data, isLoading } = useGetUserQuery(ticket?.assignees?.[0]?.id ?? skipToken)
	const { width, height } = useScreenSize()
	const parsedDueDate = typeof ticket?.dueDate === 'string' ? parseISO(ticket.dueDate) : ticket?.dueDate
	const dueDatePassed = parsedDueDate ? isAfter( new Date(), parsedDueDate) : false
	const dueDateWithinOneWeek = parsedDueDate ? isSameWeek(parsedDueDate, new Date(),{ weekStartsOn: 1 }) && !dueDatePassed : false
	const showDueDateBadge = () => {
		return (
			<div className = {`tw-relative tw-w-3 tw-h-3`}>
				{
					dueDatePassed || dueDateWithinOneWeek ? (
						<div className = {`tw-w-1.5 tw-h-1.5 ${dueDatePassed ? "dark:tw-bg-red-400 tw-bg-red-500" : "tw-bg-amber-500"} tw-rounded-full`}>
						</div>
					) : (<></>)
				}
				<HoverTooltip direction={width <= LG_BREAKPOINT ? "left": "top"} text={`${typeof ticket?.dueDate === 'string' && parsedDueDate ? `Due ${format(parsedDueDate, "M/dd/yyyy")}` : "No Due Date"}`}/>
			</div>
		)
	}

	const showBorder = () => {
		if (showDueBadge){
			if (parsedDueDate && (dueDatePassed || dueDateWithinOneWeek)){
				return (
					`tw-border-l-4 ${dueDatePassed ? "dark:tw-border-red-400 tw-border-red-500" : "tw-border-amber-500"}`
				)
			}
		}
		return borderless ? "" : STANDARD_BORDER
	}

	return (
		<div 
			className = {`tw-group ${showBorder()} ${isLoadingState ? "tw-opacity-50" : ""} ${STANDARD_HOVER} tw-p-1 lg:tw-p-1.5 tw-grid tw-grid-cols-ticket-row tw-gap-x-2 tw-items-center tw-w-full tw-rounded-md tw-min-w-0`}>
			{/* Ticket name and icon */}
			<div className = {`tw-flex tw-flex-row tw-items-center tw-justify-start tw-gap-x-2 lg:tw-gap-x-4 tw-min-w-0`}>
				<div className="tw-shrink-0">
					{ticketType ? (
							<TicketTypeIcon type={ticketType} />	
						) : <></>}
				</div>
				<div className = "tw-flex-1 tw-min-w-0 tw-text-left">
					<p className = "dark:tw-text-white tw-font-medium tw-truncate tw-text-left">{ticket?.name}</p>
				</div>
			</div>
			
			{/* Priority icon - fixed width for alignment */}
			<div className="tw-shrink-0 tw-w-5 tw-flex tw-items-center tw-justify-center">
				{priority && priority in priorityIconMap ? 
				(
					<PriorityIcon type={priority} className={`${priority in PRIORITY_COLOR_MAP ? PRIORITY_COLOR_MAP[priority] : ""} tw-w-5 tw-h-5`}/>
				)
				: null}	
			</div>
			
			{/* Avatar and status */}
			<div className = {`tw-flex tw-flex-row tw-items-center tw-justify-start tw-gap-x-2 tw-min-w-0`}>
				{width >= SM_BREAKPOINT && !hideProfilePicture ? 
					<div className="tw-flex tw-flex-col tw-items-center tw-shrink-0">
						{isLoading ? <CgProfile className = {`${PRIMARY_TEXT} tw-shrink-0 tw-w-6 tw-h-6`}/> : <Avatar userInitials={getUserInitials(data)} imageUrl={data?.imageUrl} className = {`${PRIMARY_TEXT} !tw-w-6 !tw-h-6 tw-shrink-0 tw-rounded-full`}/>}
					</div>
				: null}
				<div className = "dark:tw-text-white tw-truncate tw-min-w-0 tw-flex-1 tw-text-left">{status?.name}</div>
			</div>
			
			{/* Due date badge */}
			{
				showDueBadge ? (
					<div className="tw-shrink-0">
						{showDueDateBadge()}
					</div>
				) : (
					<div></div>
				)
			}
			
			{/* Unlink button */}
			{
				showUnlink && onUnlink && ticketRelationshipId ? (
				<div className = "tw-shrink-0">
						<IconButton onClick={(e) => {
							// prevent click on this component from triggering an onclick of the parent component
							e.stopPropagation()
							e.preventDefault()
							onUnlink(ticket?.id, ticketRelationshipId)
						}}>
							<Unlink className = {`${PRIMARY_TEXT} tw-w-6 tw-h-6 tw-shrink-0`}/>	
						</IconButton>
				</div>
				) : (
					<div></div>
				)
			}
		</div>
	)
}
