import React, {useState, useEffect, useRef} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { IconContext } from "react-icons" 
import { EditTicketFormMenuDropdown } from "./EditTicketFormMenuDropdown"
import { WatchMenuDropdown } from "./WatchMenuDropdown"
import { IoMdEye as WatchIcon } from "react-icons/io";
import { BsThreeDots as MenuIcon } from "react-icons/bs";
import { FiShare2 as ShareIcon } from "react-icons/fi";
import { useClickOutside } from "../hooks/useClickOutside" 
import { Ticket, Status } from "../types/common"
import { TICKETS } from "../helpers/routes"
import { addToast } from "../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

type Props = {
	ticket: Ticket | null | undefined	
	boardId: number | string | null | undefined
	statusesToDisplay: Array<Status>
}

export const EditTicketFormToolbar = ({statusesToDisplay, ticket, boardId}: Props) => {
	const { showModal } = useAppSelector((state) => state.modal)
	const [showDropdown, setShowDropdown] = useState(false)
	const [showWatchDropdown, setShowWatchDropdown] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const watchMenuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)
	const watchButtonRef = useRef(null)
	const dispatch = useAppDispatch()

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
				<IconContext.Provider value = {{color: "var(--bs-primary)"}}>
					<button ref = {watchButtonRef} onClick={(e) => {
						e.preventDefault()	
						setShowWatchDropdown(!showWatchDropdown)
					}}>
						<WatchIcon className = "tw-ml-3 --l-icon"/>
					</button>
					{
						showWatchDropdown ? (
							<WatchMenuDropdown ticket={ticket} ref = {watchMenuDropdownRef}/>
						) : null
					}
				</IconContext.Provider>
			</div>
			<IconContext.Provider value = {{color: "var(--bs-primary)"}}>
				<button onClick={(e) => {
					e.preventDefault()	
					navigator.clipboard.writeText(`${window.location.origin}${TICKETS}/${ticket?.id}`)
					dispatch(addToast({
						id: uuidv4(),
						type: "success",
						message: "Link copied to clipboard",
						animationType: "animation-in"
					}))
				}}>
					<ShareIcon className = "tw-ml-3 --l-icon"/>
				</button>
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