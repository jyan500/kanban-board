import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice" 
import { Ticket, Status } from "../../types/common"
import { IconEdit } from "../icons/IconEdit"
import { IconBulkAction } from "../icons/IconBulkAction"
import { TextIconRow } from "../page-elements/TextIconRow"
import { PRIMARY_TEXT, STANDARD_HOVER } from "../../helpers/constants"

type Props = {
	boardId: string | number | null | undefined
	statusesToDisplay: Array<Status>
	isMobile?: boolean
	dropdownAlignLeft?: boolean
	closeDropdown: () => void
}

export const BoardToolbarDropdown = React.forwardRef<HTMLDivElement, Props>(({
	statusesToDisplay, 
	boardId, 
	closeDropdown, 
	isMobile,
	dropdownAlignLeft,
}: Props, ref) => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	const dispatch = useAppDispatch()
	const options = {
		...(isAdminOrBoardAdmin ? {"Edit Columns": () => {
			dispatch(toggleShowModal(true))
			dispatch(setModalType("BOARD_STATUS_FORM"))
		}} : {}),
		"Bulk Actions": () => {
			dispatch(toggleShowModal(true))
			dispatch(setModalType("BULK_ACTIONS_MODAL"))
			dispatch(setModalProps({
				boardId: boardId
			}))
		},
	}
	const optionIcons = {
		...(isAdminOrBoardAdmin ? {"Edit Columns": <IconEdit className = "tw-w-4 tw-h-4"/>} : {}),
		"Bulk Actions": <IconBulkAction className = "tw-w-4 tw-h-4"/>
	}
	return (
		<Dropdown alignLeft={dropdownAlignLeft} isMobile={isMobile} closeDropdown={closeDropdown} ref = {ref}>
			<ul>
				{Object.keys(options).map((option) => (
					<li
						key={option}
						onClick={(e) => {
							options[option as keyof typeof options]?.()
							closeDropdown()
						}}
						className={`tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-block tw-px-4 tw-py-2 tw-text-sm ${PRIMARY_TEXT} ${STANDARD_HOVER}`}
						role="menuitem"
					>

						<TextIconRow icon={optionIcons[option as keyof typeof optionIcons]} text={option}/>
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

