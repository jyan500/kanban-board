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
import { NotificationDropdown } from "../NotificationDropdown"
import { 
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
	const [currentNotifications, setCurrentNotifications] = useState<Array<Notification>>([])

	const { data: notifications, isLoading: isGetNotificationsLoading } = useGetNotificationsQuery({}, {
		pollingInterval: 30000,
		skipPollingIfUnfocused: true
	}) 
	// TODO: need to figure out why this causes other cache invalidation requests to lag (i.e add/remove ticket watchers)
	// const { data: newNotifications, isLoading: isGetNewNotificationsLoading } = usePollNotificationsQuery(lastId !== 0 ? {lastId: lastId} : skipToken, {
	// 	pollingInterval: 31000,
	// 	// skipPollingIfUnfocused: true
	// })

    const [ updateNotification, { error: updateNotificationError, isLoading: isUpdateNotificationLoading} ] = useUpdateNotificationMutation();
    const [ bulkEditNotifications, { error: bulkEditNotificationsError, isLoading: isBulkEditNotificationsLoading }] = useBulkEditNotificationsMutation()

	useEffect(() => {
		if (notifications?.data && notifications?.data.length > 0){
			const unreadMessages = notifications.data.filter(n => !n.isRead)
			const newLastUnreadId = Math.max(...unreadMessages.map(n => n.id))
			if (lastId < newLastUnreadId){
				setLastId(Math.max(...notifications.data.map(n => n.id)))
			}
			setShowIndicator(unreadMessages.length > 0)
			setCurrentNotifications(notifications.data)
		}
	}, [notifications])

	// useEffect(() => {
	// 	if (newNotifications && newNotifications?.length > 0){
	// 		const unreadMessages = newNotifications.filter(n => !n.isRead)
	// 		const newLastUnreadId = Math.max(...unreadMessages.map(n => n.id))
	// 		if (lastId < newLastUnreadId){
	// 			setLastId(Math.max(...newNotifications.map(n => n.id)))
	// 		}
	// 		setShowIndicator(unreadMessages.length > 0)
	// 		setCurrentNotifications([...newNotifications, ...currentNotifications])
	// 	}
	// }, [newNotifications])

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

	const markMessagesRead = async () => {
		const unreadMessages = currentNotifications.filter(n => !n.isRead)
		if (unreadMessages.length){
			try {
				await bulkEditNotifications({isRead: true, ids: currentNotifications.map((n) => n.id) ?? []}).unwrap()
			}
			catch (err){
				dispatch(addToast({
					id: uuidv4(),
					message: "Failed to mark notifications as read.",
					animationType: "animation-in",
					type: "failure"
				}))
			}
		}		
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	return (
		<div className = "tw-my-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center">
			<HamburgerButton/>	
			{
				width >= SM_BREAKPOINT ? (
				<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center">
					{!isLoading ? (
						<>
							<div className = "tw-mt-1 tw-relative tw-inline-block tw-text-left">
								<IconContext.Provider value = {{color: "var(--bs-dark-gray"}}>
									<button ref = {buttonRef} onClick={(e) => {
										e.preventDefault()
										setShowDropdown(!showDropdown)
									}} className = "--transparent tw-p-0 hover:tw-opacity-60 tw-relative">
										<FaRegBell className = "--l-icon"/>
										<Indicator showIndicator={showIndicator}/>
									</button>
									{
										showDropdown ? (
											<NotificationDropdown 
												notifications={currentNotifications ?? []}
												closeDropdown={onClickOutside} 
												ref = {menuDropdownRef}/>
										) : null
									}
								</IconContext.Provider>
							</div>
							<Avatar imageUrl = {userProfile?.imageUrl} size = "s" className = "tw-rounded-full"/>
							<div>
								<span>{displayUser(userProfile)}</span>
							</div>
						</>
					) : (
						<LoadingSpinner/>
					)}
					<div>
						<button onClick={onLogout}>Logout</button>
					</div>
				</div>
			) : (
				/* On the mobile version, only display the bell icon, and tapping it will link to the notifications page */
				<div className = "tw-mt-1 tw-relative tw-inline-block tw-text-left">
					<IconContext.Provider value = {{color: "var(--bs-dark-gray"}}>
						<Link to={NOTIFICATIONS} className = "--transparent tw-p-0 hover:tw-opacity-60 tw-relative">
							<FaRegBell className = "--l-icon"/>
							<Indicator showIndicator={showIndicator}/>
						</Link>
					</IconContext.Provider>
				</div>
			)}
		</div>
	)
}
