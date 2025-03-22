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
import { IconPlus } from "../icons/IconPlus"
import { IconEdit } from "../icons/IconEdit"
import { IconEyeSlash } from "../icons/IconEyeSlash"
import { TextIconRow } from "../page-elements/TextIconRow"

type Props = {
	closeDropdown: () => void
	statusId: number
	boardId: number
	isMobile?: boolean
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
	dropdownAlignLeft?: boolean 
}

export const StatusHeaderDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, statusId, boardId, addTicketHandler, hideStatusHandler, isMobile, dropdownAlignLeft}: Props, ref) => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")

	const options = {
		"Add Ticket": {
			text: "Add Ticket",
			icon: <IconPlus/>,
			onClick: () => {
				addTicketHandler(statusId)
			},
		},
		...(isAdminOrBoardAdmin ? {
			"Set Column Limit": {
				text: "Set Column Limit",
				icon: <IconEdit/>,
				onClick: () => {
					dispatch(toggleShowSecondaryModal(true))
					dispatch(setSecondaryModalProps<SetColumnLimitModalProps>({
						boardId, statusId	
					}))
					dispatch(setSecondaryModalType("SET_COLUMN_LIMIT_MODAL"))
				}
		}} : {}),
		...(isAdminOrBoardAdmin ? {
			"Hide Column": {
				text: "Hide Column",
				icon: <IconEyeSlash/>,
				onClick: () => {
				hideStatusHandler(statusId)
			}
		}} : {}),
	}

	return (
		<Dropdown closeDropdown={closeDropdown} isMobile={isMobile} ref = {ref} alignLeft={dropdownAlignLeft}>
			<ul>
				{Object.values(options).map((option) => (
					<li
						key={option.text}
						onClick={(e) => {
							if (e.defaultPrevented){
								return 
							}
							option.onClick()
							closeDropdown()
						}}
						className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
						role="menuitem"
					>
						<TextIconRow text={option.text} icon={option.icon}/>
					</li>
				))}			
			</ul>
		</Dropdown>
	)	
})

