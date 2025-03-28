import React, {useState, useEffect, useRef} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { IconContext } from "react-icons" 
import { EditTicketFormMenuDropdown } from "./dropdowns/EditTicketFormMenuDropdown"
import { WatchMenuDropdown } from "./dropdowns/WatchMenuDropdown"
import { IconMenu } from "./icons/IconMenu"
import { IconEye } from "./icons/IconEye"
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { IconShare } from "./icons/IconShare"
import { useClickOutside } from "../hooks/useClickOutside" 
import { Ticket, Status, UserProfile } from "../types/common"
import { TICKETS } from "../helpers/routes"
import { addToast } from "../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { useScreenSize } from "../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../helpers/constants"

type Props = {
	ticket: Ticket | null | undefined	
	ticketWatchers: Array<UserProfile> | null | undefined 
	ticketAssignee: UserProfile | null | undefined
	boardId: number | string | null | undefined
	statusesToDisplay: Array<Status>
}

export const EditTicketFormToolbar = ({statusesToDisplay, ticket, ticketAssignee, ticketWatchers, boardId}: Props) => {
	const { showModal } = useAppSelector((state) => state.modal)
	const [showDropdown, setShowDropdown] = useState(false)
	const [showWatchDropdown, setShowWatchDropdown] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const watchMenuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)
	const watchButtonRef = useRef(null)
	const dispatch = useAppDispatch()
	const { width, height } = useScreenSize()

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	const onClickWatchOutside = () => {
		setShowWatchDropdown(false)
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)
	useClickOutside(watchMenuDropdownRef, onClickWatchOutside, watchButtonRef)

	useEffect(() => {
		if (!showModal){
			setShowDropdown(false)
			setShowWatchDropdown(false)
		}
	}, [showModal])

	return (
		<div className = "tw-pt-2 tw-pb-2 tw-flex tw-flex-row tw-justify-end tw-w-full">
			<div className = "tw-relative tw-inline-block tw-text-left">
				<button className = "hover:tw-opacity-60" ref = {watchButtonRef} onClick={(e) => {
					e.preventDefault()	
					setShowWatchDropdown(!showWatchDropdown)
				}}>
					<div className = "tw-flex tw-flex-row tw-gap-x-1 tw-items-center">
						<IconEye color={"var(--bs-primary"} className = "tw-ml-3 --l-icon"/>
						{
							(ticketWatchers && ticketWatchers?.length > 0 ? (
								<span className = "tw-text-primary">{ticketWatchers.length}</span>
							) : null)
						}
					</div>
				</button>
				{
					showWatchDropdown ? (
						<WatchMenuDropdown closeDropdown={onClickWatchOutside} ticketAssignee={ticketAssignee} ticketWatchers={ticketWatchers} ticket={ticket} ref = {watchMenuDropdownRef}/>
					) : null
				}
			</div>
			<button className = "hover:tw-opacity-60" onClick={(e) => {
				e.preventDefault()	
				navigator.clipboard.writeText(`${window.location.origin}${TICKETS}/${ticket?.id}`)
				dispatch(addToast({
					id: uuidv4(),
					type: "success",
					message: "Link copied to clipboard",
					animationType: "animation-in"
				}))
			}}>
				<IconShare color = {"var(--bs-primary"} className = "tw-ml-3 --l-icon"/>
			</button>
			<div className = "tw-relative tw-inline-block tw-text-left">
				<button ref = {buttonRef} onClick={(e) => {
					e.preventDefault()
					setShowDropdown(!showDropdown)
				}} className = "--transparent tw-p-0 hover:tw-opacity-60"><IconMenu color={"var(--bs-dark-grey)"} className = "tw-ml-3 --l-icon"/></button>
				{
					showDropdown ? (
						<EditTicketFormMenuDropdown closeDropdown={onClickOutside} statusesToDisplay={statusesToDisplay} boardId={boardId} ticket={ticket} ref = {menuDropdownRef}/>
					) : null
				}
			</div>
		</div>
	)
}