import React, {useState, useEffect, useRef} from "react"
import { useAppSelector } from "../hooks/redux-hooks"
import { IconContext } from "react-icons" 
import { EditTicketFormMenuDropdown } from "./EditTicketFormMenuDropdown"
import { IoMdEye as WatchIcon } from "react-icons/io";
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { FiShare2 as ShareIcon } from "react-icons/fi";
import { useClickOutside } from "../hooks/useClickOutside" 
import { Ticket, Status } from "../types/common"

type Props = {
	ticket: Ticket | null | undefined	
	boardId: number | string | null | undefined
	statusesToDisplay: Array<Status>
}

export const EditTicketFormToolbar = ({statusesToDisplay, ticket, boardId}: Props) => {
	const { showModal } = useAppSelector((state) => state.modal)
	const [showDropdown, setShowDropdown] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	useEffect(() => {
		if (!showModal){
			setShowDropdown(false)
		}
	}, [showModal])
	return (
		<div className = "tw-pt-2 tw-pb-2 tw-flex tw-flex-row tw-justify-end tw-w-full">
			<IconContext.Provider value = {{color: "var(--bs-primary)"}}>
				<WatchIcon className = "tw-ml-3 --l-icon"/>
			</IconContext.Provider>
			<IconContext.Provider value = {{color: "var(--bs-primary)"}}>
				<ShareIcon className = "tw-ml-3 --l-icon"/>
			</IconContext.Provider>
			<div className = "tw-relative tw-inline-block tw-text-left">
				<IconContext.Provider value = {{color: "var(--bs-dark-gray"}}>
					<button ref = {buttonRef} onClick={(e) => {
						e.preventDefault()
						setShowDropdown(!showDropdown)
					}} className = "--transparent tw-p-0"><MenuIcon className = "tw-ml-3 --l-icon"/></button>
					{
						showDropdown ? (
							<EditTicketFormMenuDropdown statusesToDisplay={statusesToDisplay} boardId={boardId} ticket={ticket} ref = {menuDropdownRef}/>
						) : null
					}
				</IconContext.Provider>
			</div>
		</div>
	)
}