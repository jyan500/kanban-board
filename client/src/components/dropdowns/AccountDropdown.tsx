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
import { getUserInitials, displayUser } from "../../helpers/functions"
import { useNavigate } from "react-router-dom"
import { Badge } from "../page-elements/Badge"
import { IconBell } from "../icons/IconBell"
import { IconAccount } from "../icons/IconAccount"
import { IconBuildingUser } from "../icons/IconBuildingUser"
import { IconLogout } from "../icons/IconLogout"
import { IconDarkMode } from "../icons/IconDarkMode"
import { IconLightMode } from "../icons/IconLightMode"
import { TextIconRow } from "../page-elements/TextIconRow"
import { setDarkMode } from "../../slices/darkModeSlice"
import { useDarkMode } from "../../hooks/useDarkMode"
import { STANDARD_DROPDOWN_ITEM, STANDARD_HOVER } from "../../helpers/constants"

type Props = {
	isTemp: boolean
	numNotifications: number
	closeDropdown: () => void
	onLogout: () => void
}


export const AccountDropdown = React.forwardRef<HTMLDivElement, Props>(({isTemp, numNotifications, closeDropdown, onLogout}: Props, ref) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { isDarkMode } = useAppSelector((state) => state.darkMode)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")

	useDarkMode("account-dropdown", isDarkMode)

	const options = {
		"Account": {
			text: "Account",
			icon: <IconAccount/>,
			onClick: () => {
				navigate(isTemp ? `${TEMP}${ACCOUNT}` : ACCOUNT)
			}
		},
		...(isDarkMode ? {
			"Light Mode": {
				text: "Light Mode",
				icon: <IconLightMode/>,
				onClick: () => {
					dispatch(setDarkMode({isDarkMode: false}))
				}
			}
		} : {
			"Dark Mode": {
				text: "Dark Mode",
				icon: <IconDarkMode/>,
				onClick: () => {
					dispatch(setDarkMode({isDarkMode: true}))
				}
			}
		}),
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
		<Dropdown id={"account-dropdown"} closeDropdown={closeDropdown} ref = {ref} className = "lg:!tw-w-96 !tw-w-92">
			<ul>
				<li className = "tw-border-b tw-border-gray-200 tw-flex tw-flex-row tw-items-center tw-gap-x-4 tw-px-4 tw-py-2">
					<Avatar userInitials={getUserInitials(userProfile)} imageUrl = {userProfile?.imageUrl} size = "m" className = "tw-rounded-full"/>
					<div className = "tw-flex tw-flex-col">
						<h3 className = "tw-m-0 tw-font-semibold">{displayUser(userProfile)}</h3>
						<p className = "dark:tw-text-white tw-text-gray-700">{userProfile?.email}</p>
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
								if (option.text !== "Light Mode" && option.text !== "Dark Mode"){
									closeDropdown()
								}
							}}
							className={STANDARD_DROPDOWN_ITEM}
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

