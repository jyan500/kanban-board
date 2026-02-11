import React, {useState, useRef, ReactNode} from "react"
import "../styles/ticket.css"
import type { Ticket as TicketType, Status } from "../types/common"
import { useAppSelector } from "../hooks/redux-hooks"
import { IoReorderTwoOutline as MediumPriorityIcon } from "react-icons/io5";
import { HiChevronDoubleUp as HighPriorityIcon } from "react-icons/hi2";
import { HiChevronDown as LowPriorityIcon } from "react-icons/hi2";
import { IconLowPriority } from "./icons/IconLowPriority"
import { IconMediumPriority } from "./icons/IconMediumPriority"
import { IconHighPriority } from "./icons/IconHighPriority"
import { IconLink } from "./icons/IconLink"
import { IconMenu } from "./icons/IconMenu"
import { IconEye } from "./icons/IconEye"
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
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { EditTicketFormMenuDropdown } from "./dropdowns/EditTicketFormMenuDropdown"
import { useClickOutside } from "../hooks/useClickOutside" 
import { useScreenSize } from "../hooks/useScreenSize"
import { getUserInitials } from "../helpers/functions"
import { HoverTooltip } from "./page-elements/HoverTooltip";
import { 
	AVATAR_SIZES, 
	LG_BREAKPOINT, 
	PRIMARY_TEXT, 
	PRIORITY_COLOR_MAP, 
	SECONDARY_TEXT, 
	STANDARD_HOVER,
	TERTIARY_TEXT,
	TICKET_BACKGROUND_COLOR
} from "../helpers/constants"

export const priorityIconMap: {[key: string]: ReactNode} = {
	"Low": <LowPriorityIcon/>,	
	"Medium": <MediumPriorityIcon/>,
	"High": <HighPriorityIcon/>,
}

interface PriorityIconProps {
	type: string
	color?: string
	className?: string
}

export const PriorityIcon = ({type, color, className}: PriorityIconProps) => {
	switch (type){
		case "Low":
			return <IconLowPriority className={className} color={color}/>
		case "Medium":
			return <IconMediumPriority className={className} color={color}/>
		case "High":
			return <IconHighPriority className={className} color={color}/>
	}
	return <div></div>
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


type PropType = {
	ticket: TicketType
	statusesToDisplay: Array<Status>
	boardId: number
	dropdownAlignLeft?: boolean
	isLoading?: boolean
}

export const Ticket = ({ticket, boardId, statusesToDisplay, dropdownAlignLeft, isLoading}: PropType) => {
	const {priorities} = useAppSelector((state) => state.priority)
	const {statuses} = useAppSelector((state) => state.status)
	const {ticketTypes} = useAppSelector((state) => state.ticketType)
	const { data } = useGetUserQuery(ticket?.assignees?.[0]?.id ?? skipToken)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)
	const [showDropdown, setShowDropdown] = useState(false)

	const priority = priorities.find((p) => p.id === ticket.priorityId)?.name
	const ticketType = ticketTypes.find((t) => t.id === ticket.ticketTypeId)?.name
	const { width, height } = useScreenSize()

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = {`tw-relative tw-w-full tw-h-full tw-flex tw-flex-col tw-items-start tw-bg-white tw-rounded-md tw-shadow-md ${TICKET_BACKGROUND_COLOR} ${STANDARD_HOVER} tw-p-2 tw-gap-y-2`}>
			<div className = "tw-w-full tw-flex tw-flex-row tw-justify-between tw-gap-x-1 tw-text-wrap">
				<span className = {`${PRIMARY_TEXT} tw-w-4/5 tw-font-medium tw-break-words`}>{ticket.name}</span>
				{ticket?.assignees?.[0]?.id ? <Avatar userInitials={getUserInitials(data)} imageUrl={data?.imageUrl} className = {`${PRIMARY_TEXT} !tw-w-6 !tw-h-6 tw-shrink-0 tw-mt-1 tw-rounded-full`}/> :
				<CgProfile className = {`${PRIMARY_TEXT} ${AVATAR_SIZES["s"]}`}/>}
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
			<div className = "tw-flex tw-flex-row tw-justify-between tw-w-full">
				<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
					{ticketType ? (
						<TicketTypeIcon type = {ticketType} className = {"tw-shrink-0 tw-w-5 tw-h-5"}/>
					) : <></>}
					{
						priority ? (<PriorityIcon type={priority} className={`${priority in PRIORITY_COLOR_MAP ? PRIORITY_COLOR_MAP[priority] : ""} tw-shrink-0 tw-w-5 tw-h-5`}/>) : <></>
					}
					{
						ticket.hasNonEpicRelationship ? 
						<div className = "tw-group tw-relative">
							<IconLink className = {`${SECONDARY_TEXT} icon`}/>
							<HoverTooltip text={"Linked ticket"} direction={"top"}/>
						</div>
						: null
					}
					{
						ticket.isWatching ? 
						<div className = "tw-group tw-relative">
							<IconEye className = {`${TERTIARY_TEXT} icon`}/>	
							<HoverTooltip text={"You are watching this ticket"} direction={"top"}/>
						</div> : 
						null
					}
				</div>
				<div className = {"tw-inline-block tw-text-left"}>
					{!isLoading ? (
						<>
							<button ref = {buttonRef} onClick={(e) => {
								// the prevent default here is to avoid the edit ticket form modal from opening
								// when clicking the "..." menu on the individual ticket rather than from inside the edit ticket form modal
								e.preventDefault()
								setShowDropdown(!showDropdown)
							}} className = "--transparent tw-p-0 hover:tw-opacity-60"><IconMenu className = {`${PRIMARY_TEXT} tw-ml-3 tw-w-4 tw-h-4`}/></button>
							{
								showDropdown ? (
									<EditTicketFormMenuDropdown dropdownAlignLeft={dropdownAlignLeft} closeDropdown={onClickOutside} statusesToDisplay={statusesToDisplay} boardId={boardId} ticket={ticket} ref = {menuDropdownRef}/>
								) : null
							}
						</>
					) : (
						<LoadingSpinner/>
					)}
				</div>
			</div>
		</div>
	)	
}