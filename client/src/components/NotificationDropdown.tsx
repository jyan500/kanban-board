import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { 
	useUpdateNotificationMutation,
	useBulkEditNotificationsMutation, 
} from "../services/private/notification"
import { addToast } from "../slices/toastSlice"
import { Toast, Notification } from "../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { NOTIFICATIONS } from "../helpers/routes"

type Props = {
	notifications: Array<Notification> | undefined | null
	closeDropdown: () => void
}

type ReadOnlyDropdownOptionProps = {
	children: React.ReactNode
}

const ReadOnlyDropdownOption = ({children}: ReadOnlyDropdownOptionProps) => {
	return (
		<div className = "tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-x-2 tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700">
			{children}	
		</div>
	)
}

export const NotificationDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, notifications}: Props, ref) => {
	const dispatch = useAppDispatch()
    const [ bulkEditNotifications, { error: bulkEditNotificationsError, isLoading: isBulkEditNotificationsLoading }] = useBulkEditNotificationsMutation()
    const [ updateNotification, {error: updateNotificationError, isLoading: isUpdateNotificationLoading}] = useUpdateNotificationMutation()
	const markMessagesRead = async (messages: Array<Notification>) => {
		if (messages?.length){
			try {
				await bulkEditNotifications({isRead: true, ids: messages?.map((n) => n.id) ?? []}).unwrap()
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

	const markMessageRead = async (message: Notification) => {
		try {
			await updateNotification({isRead: true, id: message.id}).unwrap()
		}
		catch {
			dispatch(addToast({
				id: uuidv4(),
				message: "Failed to mark notification as read.",
				animationType: "animation-in",
				type: "failure"
			}))	
		}
	}

	return (
		<Dropdown className = {"!tw-w-96"} ref = {ref}>
			<ReadOnlyDropdownOption
			>
				<p className = "tw-font-bold">Notifications: </p>
				<button onClick={async () => {
					const unreadMessages = notifications?.filter(n => !n.isRead)
					if (unreadMessages?.length){
						await markMessagesRead(unreadMessages)
					}
				}} className = "button --secondary">Mark as Read</button>
			</ReadOnlyDropdownOption>
			{!notifications?.length ? <ReadOnlyDropdownOption><p>No Notifications Found</p></ReadOnlyDropdownOption> : null}
			<ul>
				{notifications?.map((notification) => (
					<Link onClick={async () => {
						closeDropdown()
						if (!notification.isRead){
							await markMessageRead(notification)}
						}
					} to = {notification.objectLink}>
						<li
							key={`notification-${notification.id}`}
							className={`${!notification.isRead ? "tw-bg-gray-50" : ""} tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900`}
							role="menuitem"
						>
							{notification.body}
						</li>
					</Link>
				))}
			</ul>
			<div className = "tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700">
				<Link to = {NOTIFICATIONS}><button className = "button --secondary" onClick={() => closeDropdown()}>See More</button></Link>
			</div>
		</Dropdown>
	)	
})

