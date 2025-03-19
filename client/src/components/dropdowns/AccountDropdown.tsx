import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { Dropdown } from "../Dropdown" 
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { NOTIFICATIONS, ACCOUNT } from "../../helpers/routes"
import { SetColumnLimitModalProps } from "../secondary-modals/SetColumnLimitModal"
import { Avatar } from "../page-elements/Avatar"
import { displayUser } from "../../helpers/functions"
import { useNavigate } from "react-router-dom"
import { Badge } from "../page-elements/Badge"

type Props = {
	numNotifications: number
	closeDropdown: () => void
	onLogout: () => void
}

export const AccountDropdown = React.forwardRef<HTMLDivElement, Props>(({numNotifications, closeDropdown, onLogout}: Props, ref) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")

	const options = {
		"Account": () => {
			navigate(ACCOUNT)
		},
		"Notifications": () => {
			navigate(NOTIFICATIONS)
		},
		"Logout": () => {
			onLogout()
		}
	}

	return (
		<Dropdown closeDropdown={closeDropdown} ref = {ref} className = "!tw-w-96">
			<ul>
				<li className = "tw-border-b tw-border-gray-200 tw-flex tw-flex-row tw-items-center tw-gap-x-4 tw-px-4 tw-py-2">
					<Avatar imageUrl = {userProfile?.imageUrl} size = "m" className = "tw-rounded-full"/>
					<div className = "tw-flex tw-flex-col">
						<h3 className = "tw-m-0 tw-font-semibold">{displayUser(userProfile)}</h3>
						<p className = "tw-text-gray-700">{userProfile?.email}</p>
					</div>
				</li>
				{Object.keys(options).map((option) => {
					return (
						<li
							key={option}
							onClick={(e) => {
								if (e.defaultPrevented){
									return 
								}
								options[option as keyof typeof options]?.()
								closeDropdown()
							}}
							className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
							role="menuitem"
						>
						{
							option === "Notifications" ? 
							(
								<div className = "tw-flex tw-flex-row tw-items-center tw-justify-between">
									<span>{option}</span>	
									{
										numNotifications > 0 ? (
											<div className = "tw-px-2 tw-bg-red-500 tw-rounded-full">
												<span className = "tw-text-white">{numNotifications}</span>
											</div>
										) : null
									}
								</div>
							) : <span>{option}</span> 
						}
						</li>
					)
				})}			
			</ul>
		</Dropdown>
	)	
})

