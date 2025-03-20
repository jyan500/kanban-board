import React, {useState, useEffect, useRef} from "react"
import { HamburgerButton } from "../HamburgerButton"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { logout } from "../../slices/authSlice" 
import { LoadingSpinner } from "../LoadingSpinner"
import { privateApi } from "../../services/private" 
import { displayUser } from "../../helpers/functions"
import { Avatar } from "./Avatar"
import { useClickOutside } from "../../hooks/useClickOutside" 
import { FaRegBell } from "react-icons/fa";
import { IconContext } from "react-icons"
import { Indicator } from "../../components/page-elements/Indicator"
import { NotificationDropdown } from "../dropdowns/NotificationDropdown"
import { AccountDropdown } from "../dropdowns/AccountDropdown"
import { 
	notificationApi,
	useGetNotificationsQuery, 
	usePollNotificationsQuery,
	useBulkEditNotificationsMutation, 
	useUpdateNotificationMutation 
} from "../../services/private/notification"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useScreenSize } from "../../hooks/useScreenSize"
import { SM_BREAKPOINT } from "../../helpers/constants"
import { NOTIFICATIONS } from "../../helpers/routes"
import { Link } from "react-router-dom"

export const TopNav = () => {
	const dispatch = useAppDispatch()
	const [showDropdown, setShowDropdown] = useState(false)
	const { width, height } = useScreenSize()
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const [isLoading, setIsLoading] = useState(true)
	const [showIndicator, setShowIndicator] = useState(false)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef(null)
	const [lastId, setLastId] = useState(0)

	// TODO: need to figure out why this causes other cache invalidation requests to lag (i.e add/remove ticket watchers)
	const { data: polledNotifications, isLoading: isGetPolledNotificationsLoading } = useGetNotificationsQuery({isUnread: true}, {
		pollingInterval: 30000,
		// skipPollingIfUnfocused: true
	})

	useEffect(() => {
		/* If there are new notifications, have to manually re-fetch notifications for the notifications page */
		if (polledNotifications && polledNotifications?.data.length > 0){
			dispatch(notificationApi.util.invalidateTags(["Notifications"]))
		}
	}, [polledNotifications])

	useEffect(() => {
		if (userProfile && Object.keys(userProfile).length){
			setIsLoading(false)
		}
	}, [userProfile])

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	const onLogout = () => {
		dispatch(logout())
		dispatch(privateApi.util.resetApiState())
	}

	// const markMessagesRead = async () => {
	// 	const unreadMessages = currentNotifications.filter(n => !n.isRead)
	// 	if (unreadMessages.length){
	// 		try {
	// 			await bulkEditNotifications({isRead: true, ids: currentNotifications.map((n) => n.id) ?? []}).unwrap()
	// 		}
	// 		catch (err){
	// 			dispatch(addToast({
	// 				id: uuidv4(),
	// 				message: "Failed to mark notifications as read.",
	// 				animationType: "animation-in",
	// 				type: "failure"
	// 			}))
	// 		}
	// 	}		
	// }

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = "tw-my-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center">
			<HamburgerButton/>	
			<div className = "tw-relative tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
				{!isLoading ? (
					<>
						<div className = "tw-mt-1">
							<button className = "--transparent tw-p-0 hover:tw-opacity-60 tw-relative" ref = {buttonRef} onClick={(e) => {
								e.preventDefault()
								setShowDropdown(!showDropdown)
							}}>
								<Avatar imageUrl = {userProfile?.imageUrl} size = "s" className = "tw-rounded-full"/>
								{
									<Indicator showIndicator={polledNotifications?.data ? polledNotifications?.data.length > 0 : false} className = "tw-h-3 tw-w-3 -tw-bottom-0.5 -tw-right-0.5 tw-bg-red-500"/>
								}
							</button>
							{
								showDropdown ? (
									<AccountDropdown numNotifications={polledNotifications?.data ? polledNotifications?.data.length : 0} ref={menuDropdownRef} onLogout={onLogout} closeDropdown={onClickOutside}/>
								) : null
							}
						</div>
						{
							width >= SM_BREAKPOINT ? (
								<div>
									<span>{displayUser(userProfile)}</span>
								</div>
							) : null
						}
					</>
				) : (
					<LoadingSpinner/>
				)
			}
			</div>
		</div>
	)
}
