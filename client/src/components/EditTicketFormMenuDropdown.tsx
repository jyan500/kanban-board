import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../slices/secondaryModalSlice" 
import { Ticket, Status } from "../types/common"

type Props = {
	ticket: Ticket | null | undefined
	boardId: string | number | null | undefined
	statusesToDisplay: Array<Status>
}

export const EditTicketFormMenuDropdown = React.forwardRef<HTMLDivElement, Props>(({statusesToDisplay, boardId, ticket}: Props, ref) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")
	const isTicketReporter = userRole && userRole === "USER" && ticket?.userId === userProfile?.id
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
	let options = {
		"Move": () => {
			dispatch(toggleShowSecondaryModal(true))
			dispatch(setSecondaryModalType("MOVE_TICKET_FORM_MODAL"))
			dispatch(setSecondaryModalProps({"boardId": boardId, "ticketId": ticket?.id}))
		},
		"Clone": () => {
			dispatch(toggleShowSecondaryModal(true))
			dispatch(setSecondaryModalType("CLONE_TICKET_FORM_MODAL"))
			dispatch(setSecondaryModalProps({"statusesToDisplay": statusesToDisplay, "boardId": boardId, "ticket": ticket}))
		},
		// if it's an epic, do not show this button
		...(epicTicketType?.id !== ticket?.ticketTypeId ? {"Add to Epic": () => {
			dispatch(toggleShowSecondaryModal(true))
			dispatch(setSecondaryModalType("ADD_TO_EPIC_FORM_MODAL"))
			dispatch(setSecondaryModalProps({"childTicketId": ticket?.id}))
		}} : {}),
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

