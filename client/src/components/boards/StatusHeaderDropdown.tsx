import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { Dropdown } from "../Dropdown" 
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { NOTIFICATIONS } from "../../helpers/routes"
import { SetColumnLimitModalProps } from "../secondary-modals/SetColumnLimitModal"

type Props = {
	closeDropdown: () => void
	statusId: number
	boardId: number
	isMobile: boolean
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
}

export const StatusHeaderDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, statusId, boardId, addTicketHandler, hideStatusHandler, isMobile}: Props, ref) => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")

	const options = {
		"Add Ticket": () => {
			addTicketHandler(statusId)
		},
		...(isAdminOrBoardAdmin ? {"Set Column Limit": () => {
			dispatch(toggleShowSecondaryModal(true))
			dispatch(setSecondaryModalProps<SetColumnLimitModalProps>({
				boardId, statusId	
			}))
			dispatch(setSecondaryModalType("SET_COLUMN_LIMIT_MODAL"))
		}} : {}),
		...(isAdminOrBoardAdmin ? {"Hide Column": () => {
			hideStatusHandler(statusId)
		}} : {}),
	}

	return (
		<Dropdown closeDropdown={closeDropdown} isMobile={isMobile} ref = {ref}>
			<ul>
				{Object.keys(options).map((option) => (
					<li
						key={option}
						onClick={() => {
							options[option as keyof typeof options]?.()
							closeDropdown()
						}}
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

