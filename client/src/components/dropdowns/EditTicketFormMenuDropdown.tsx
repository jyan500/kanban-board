import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice" 
import { Ticket, Status } from "../../types/common"
import { TextIconRow } from "../page-elements/TextIconRow"
import { IconMove } from "../icons/IconMove"
import { IconDelete } from "../icons/IconDelete"
import { IconCopy } from "../icons/IconCopy"
import { IconPlus } from "../icons/IconPlus"
import { STANDARD_DROPDOWN_ITEM } from "../../helpers/constants"

type Props = {
	ticket: Ticket | null | undefined
	boardId: string | number | null | undefined
	statusesToDisplay: Array<Status>
	isMobile?: boolean
	dropdownAlignLeft?: boolean
	closeDropdown: () => void
}

export const EditTicketFormMenuDropdown = React.forwardRef<HTMLDivElement, Props>(({
	statusesToDisplay, 
	boardId, 
	ticket, 
	closeDropdown, 
	isMobile,
	dropdownAlignLeft,
}: Props, ref) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")
	const isTicketReporter = userRole && userRole === "USER" && ticket?.userId === userProfile?.id
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
	let options = {
		"Move": {
			text: "Move",
			icon: <IconMove/>,
			onClick: () => {
				dispatch(toggleShowSecondaryModal(true))
				dispatch(setSecondaryModalType("MOVE_TICKET_FORM_MODAL"))
				dispatch(setSecondaryModalProps({"boardId": boardId, "ticketId": ticket?.id}))
			}
		},
		"Clone": {
			text: "Clone",
			icon: <IconCopy/>,
			onClick: () => {
				dispatch(toggleShowSecondaryModal(true))
				dispatch(setSecondaryModalType("CLONE_TICKET_FORM_MODAL"))
				dispatch(setSecondaryModalProps({"statusesToDisplay": statusesToDisplay, "boardId": boardId, "ticket": ticket}))
			}
		},
		// if it's an epic, do not show this button
		...(epicTicketType?.id !== ticket?.ticketTypeId ? {"Add to Epic": {
			text: "Add to Epic",
			icon: <IconPlus/>,
			onClick: () => {
				dispatch(toggleShowSecondaryModal(true))
				dispatch(setSecondaryModalType("ADD_TO_EPIC_FORM_MODAL"))
				dispatch(setSecondaryModalProps({"childTicketId": ticket?.id}))
			}
		}} : {}),
		...(isAdminOrBoardAdmin || isTicketReporter ? {
			"Delete": {
				text: "Delete",
				icon: <IconDelete/>,
				onClick: () => {
				dispatch(toggleShowSecondaryModal(true))
				dispatch(setSecondaryModalType("DELETE_TICKET_WARNING"))
				dispatch(setSecondaryModalProps({"currentTicketId": ticket?.id}))
			}
		}}: {})
	}
	return (
		<Dropdown alignLeft={dropdownAlignLeft} isMobile={isMobile} closeDropdown={closeDropdown} ref = {ref}>
			<ul>
				{Object.values(options).map((option) => (
					<li
						key={option.text}
						onClick={(e) => {
							if (e.defaultPrevented){
								return
							}
							e.preventDefault()
							option.onClick()
							closeDropdown()
						}}
						className={STANDARD_DROPDOWN_ITEM}
						role="menuitem"
					>
						<TextIconRow icon={option.icon} text={option.text}/>
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

