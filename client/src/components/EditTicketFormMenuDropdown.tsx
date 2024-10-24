import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { toggleShowSecondaryModal, setSecondaryModalType } from "../slices/secondaryModalSlice" 

export const EditTicketFormMenuDropdown = React.forwardRef<HTMLDivElement, unknown>((props, ref) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { tickets, currentTicketId } = useAppSelector((state) => state.board) 
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const ticket = tickets.find((ticket) => ticket.id === currentTicketId)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userRole && userRole === "ADMIN" || userRole === "BOARD_ADMIN"
	const isTicketReporter = userRole && userRole === "USER" && ticket?.userId === userProfile?.id
	let options = {
		"Move": () => console.log("Clicked move"),
		"Clone": () => console.log("Clicked clone"),
		"Add to Epic": () => {
			dispatch(toggleShowSecondaryModal(true))
			dispatch(setSecondaryModalType("ADD_TO_EPIC_FORM_MODAL"))
		},
		...(isAdminOrBoardAdmin || isTicketReporter ? {
			"Delete": () => {
				dispatch(toggleShowSecondaryModal(true))
				dispatch(setSecondaryModalType("DELETE_TICKET_WARNING"))
			}
		}: {})
	}
	return (
		<Dropdown ref = {ref}>
			<ul className = "tw-z-1000">
				{Object.keys(options).map((option) => (
					<li
						key={option}
						onClick={() => options[option as keyof typeof options]?.()}
						className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
						role="menuitem"
					>
						{option}
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

