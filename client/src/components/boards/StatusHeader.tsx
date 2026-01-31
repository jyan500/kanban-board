import React, { useState, useRef } from "react"
import { KanbanBoard, Status } from "../../types/common"
import { useAppDispatch } from "../../hooks/redux-hooks"
import { IconButton } from "../page-elements/IconButton"
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { IconMenu } from "../icons/IconMenu"
import { useClickOutside } from "../../hooks/useClickOutside" 
import { IconContext } from "react-icons"
import { StatusHeaderDropdown } from "../dropdowns/StatusHeaderDropdown"
import { Link } from "react-router-dom"
import { TICKETS } from "../../helpers/routes"
import { useScreenSize } from "../../hooks/useScreenSize"
import { LoadingSpinner } from "../LoadingSpinner"
import { LoadingStatus } from "../../types/common"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

type Props = {
	numTickets: number
	status: Status 
	boardId: number
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
	hideStatusHandlerLoading: LoadingStatus
	dropdownAlignLeft?: boolean 
}

export const StatusHeader = ({numTickets, boardId, status, addTicketHandler, hideStatusHandlerLoading, hideStatusHandler, dropdownAlignLeft}: Props) => {
	const [ showDropdown, setShowDropdown ] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const { width, height } = useScreenSize()

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = {`${status.limit && (status.limit <= numTickets) ? "tw-bg-red-100" : ""} tw-relative tw-w-full tw-py-2 tw-flex tw-flex-col tw-gap-y-1`}>
			<div className = "tw-pl-2 tw-flex tw-flex-row tw-items-center tw-justify-between">
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<p className = {`${PRIMARY_TEXT} tw-font-semibold`}>
						{status.name}
					</p>
					<span className = {SECONDARY_TEXT}>
						{numTickets}
					</span>
				</div>
				{
					status.limit && (status.limit <= numTickets) ?
					<div className = "tw-p-0.5 tw-border tw-border-red-300 tw-bg-red-300">
						<p className = "tw-font-semibold">Max: {status.limit}</p>
					</div>
					: null
				}
				{
					hideStatusHandlerLoading.isLoading && hideStatusHandlerLoading.id === status.id ? <LoadingSpinner/> : (
						<div className = "tw-inline-block tw-text-left tw-pr-2">
							<button ref = {buttonRef} onClick={(e) => {
								e.preventDefault()
								setShowDropdown(!showDropdown)
							}} className = "--transparent tw-p-0 hover:tw-opacity-60"><IconMenu className = {`${PRIMARY_TEXT} tw-w-6 tw-h-6`}/></button>
							{
								showDropdown ? (
									<StatusHeaderDropdown dropdownAlignLeft={dropdownAlignLeft} boardId = {boardId} statusId={status.id} hideStatusHandler={hideStatusHandler} addTicketHandler={addTicketHandler} closeDropdown={onClickOutside} ref = {menuDropdownRef}/>
								) : null
							}
						</div>
					)
				}
			</div>
			{
				status.limit && (status.limit <= numTickets) ? (
				<Link className = "tw-pl-2" to={`${TICKETS}?board=${boardId}&status=${status.id}`}><span className = "tw-text-xs">Limit has been reached. View remaining tickets here</span></Link>
				) : null
			}
		</div>
	)
}
