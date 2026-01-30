import React, {useState} from "react"
import { Ticket } from "../types/common"
import { priorityIconMap, PriorityIcon, TicketTypeIcon } from "./Ticket" 
import { LG_BREAKPOINT, PRIORITY_COLOR_MAP } from "../helpers/constants"
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
		if (parsedDueDate && (dueDatePassed || dueDateWithinOneWeek)){
			if (width <= LG_BREAKPOINT){
				return (
					<div className = {`tw-w-1.5 tw-h-1.5 ${dueDatePassed ? "dark:tw-bg-red-400 tw-bg-red-500" : "tw-bg-amber-500"} tw-rounded-full`}></div>
				)
			}
			return (
				<div className = {`tw-p-1 tw-text-nowrap tw-flex tw-flex-row tw-items-center tw-gap-x-2`}>
					<div className = {`tw-w-1.5 tw-h-1.5 ${dueDatePassed ? "dark:tw-bg-red-400 tw-bg-red-500" : "tw-bg-amber-500"} tw-rounded-full`}></div>
					<span className = {`${dueDatePassed ? "dark:tw-text-red-400 tw-text-red-600" : "tw-text-amber-700"}`}>Due {typeof ticket?.dueDate === 'string' ?  format(parsedDueDate, "M/dd/yyyy") : ""}</span>
				</div>
			)
		}
		return <></>
	}

	const showBorder = () => {
		if (showDueBadge){
			if (parsedDueDate && (dueDatePassed || dueDateWithinOneWeek)){
				return (
					`tw-border-l-4 ${dueDatePassed ? "dark:tw-border-red-400 tw-border-red-500" : "tw-border-amber-500"}`
				)
			}
		}
		return borderless ? "" : "tw-border tw-border-gray-200"
	}

	return (
		<div className = {`${showBorder()} ${isLoadingState ? "tw-opacity-50" : ""} ${STANDARD_HOVER} tw-p-1 lg:tw-p-1.5 tw-flex tw-flex-row tw-items-center tw-justify-between tw-w-full tw-rounded-md`}>
			<div className = {`${(showUnlink && onUnlink && ticketRelationshipId) || showDueBadge ? "tw-w-[60%]" : "tw-w-[70%]"} lg:tw-p-1 tw-flex tw-flex-row tw-items-center tw-gap-x-4`}>
				<div>
					{ticketType ? (
							<TicketTypeIcon type={ticketType} />	
						) : <></>}
				</div>
				<div className = "tw-line-clamp-2 tw-w-3/4 tw-text-left tw-break-words"><p className = "dark:tw-text-white tw-font-medium tw-truncate tw-line-clamp-1">{ticket?.name}</p></div>
			</div>
			<div className = "lg:tw-p-1 tw-flex tw-flex-1 tw-flex-row tw-justify-start tw-items-center tw-gap-x-2">
				<div>
					{priority && priority in priorityIconMap ? 
					(
						<PriorityIcon type={priority} color={priority in PRIORITY_COLOR_MAP ? PRIORITY_COLOR_MAP[priority] : ""} className = "--l-icon --icon-thumb"/>
					)
					: <></>}	
				</div>
				{width >= SM_BREAKPOINT && !hideProfilePicture ? 
					(isLoading ? <CgProfile className = "tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6"/> : <Avatar userInitials={getUserInitials(data)} imageUrl={data?.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/>) 
				: null}
				<div className = "dark:tw-text-white tw-line-clamp-1 tw-text-left tw-break-words">{status?.name}</div>
			</div>
			{
				showDueBadge ? showDueDateBadge() : null 
			}
			{
				showUnlink && onUnlink && ticketRelationshipId ? (
				<div className = "tw-flex tw-flex-row tw-justify-end">
						<IconButton onClick={(e) => {
							// prevent click on this component from triggering an onclick of the parent component
							e.stopPropagation()
							e.preventDefault()
							onUnlink(ticket?.id, ticketRelationshipId)
						}}>
							<Unlink className = "tw-w-6 tw-h-6 tw-shrink-0"/>	
						</IconButton>
				</div>
				) : null
			}
		</div>
	)
}
