import React, { useState, useRef } from "react"
import { KanbanBoard, Status } from "../../types/common"
import { useAppDispatch } from "../../hooks/redux-hooks"
import { IconButton } from "../page-elements/IconButton"
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { useClickOutside } from "../../hooks/useClickOutside" 
import { IconContext } from "react-icons"
import { StatusHeaderDropdown } from "./StatusHeaderDropdown"

type Props = {
	numTickets: number
	statusId: number
	statusName: string
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
}

export const StatusHeader = ({numTickets, statusId, statusName, addTicketHandler, hideStatusHandler}: Props) => {
	const [ showDropdown, setShowDropdown ] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = "tw-w-full tw-py-2 tw-flex tw-flex-row tw-items-center tw-space-between">
			<div className = "tw-pl-2 tw-flex-1 tw-flex tw-flex-row tw-gap-x-2">
				<p className = "tw-font-bold">
					{statusName}
				</p>
				<span>
					{numTickets}
				</span>
			</div>
			<div className = "tw-relative tw-inline-block tw-text-left tw-pr-2">
				<IconContext.Provider value = {{color: "var(--bs-dark-gray"}}>
					<button ref = {buttonRef} onClick={(e) => {
						e.preventDefault()
						setShowDropdown(!showDropdown)
					}} className = "--transparent tw-p-0 hover:tw-opacity-60"><MenuIcon className = "tw-w-6 tw-h-6"/></button>
					{
						showDropdown ? (
							<StatusHeaderDropdown statusId={statusId} hideStatusHandler={hideStatusHandler} addTicketHandler={addTicketHandler} closeDropdown={onClickOutside} ref = {menuDropdownRef}/>
						) : null
					}
				</IconContext.Provider>
			</div>
		</div>
	)
}
