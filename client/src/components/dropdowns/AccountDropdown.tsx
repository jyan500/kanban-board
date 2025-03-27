import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { Dropdown } from "../Dropdown" 
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { TEMP, NOTIFICATIONS, ACCOUNT, ACCOUNT_SWITCH_ORGANIZATION } from "../../helpers/routes"
import { SetColumnLimitModalProps } from "../secondary-modals/SetColumnLimitModal"
import { Avatar } from "../page-elements/Avatar"
import { displayUser } from "../../helpers/functions"
import { useNavigate } from "react-router-dom"
import { Badge } from "../page-elements/Badge"
import { IconBell } from "../icons/IconBell"
import { IconAccount } from "../icons/IconAccount"
import { IconBuildingUser } from "../icons/IconBuildingUser"
import { IconLogout } from "../icons/IconLogout"
import { TextIconRow } from "../page-elements/TextIconRow"

type Props = {
	isTemp: boolean
	numNotifications: number
	closeDropdown: () => void
	onLogout: () => void
}


export const AccountDropdown = React.forwardRef<HTMLDivElement, Props>(({isTemp, numNotifications, closeDropdown, onLogout}: Props, ref) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")

	const options = {
		"Account": {
			text: "Account",
			icon: <IconAccount/>,
			onClick: () => {
				navigate(isTemp ? `${TEMP}${ACCOUNT}` : ACCOUNT)
			}
		},
		
		...(userProfile?.isActive && !isTemp ? {
			"Notifications": {
				text: "Notifications",
				icon: <IconBell/>,
				onClick: () => {
					navigate(NOTIFICATIONS)
				}
			},
			"Switch Organization": { 
				text: "Switch Organization",
				icon: <IconBuildingUser/>,
				onClick: () => {
					navigate(ACCOUNT_SWITCH_ORGANIZATION)	
				}
			},
		} : {}),
		"Logout": {
			text: "Logout",
			icon: <IconLogout/>,
			onClick: () => {
				onLogout()
			}
		},
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
				{Object.values(options).map((option) => {
					return (
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
						{
							option.text === "Notifications" ? 
							(
								<div className = "tw-flex tw-flex-row tw-items-center tw-justify-between">
									<TextIconRow text={option.text} icon={option.icon}/>
									{
										numNotifications > 0 ? (
											<div className = "tw-px-2 tw-bg-red-500 tw-rounded-full">
												<span className = "tw-text-white">{numNotifications}</span>
											</div>
										) : null
									}
								</div>
							) : 
							<TextIconRow text={option.text} icon={option.icon}/>
						}
						</li>
					)
				})}			
			</ul>
		</Dropdown>
	)	
})

