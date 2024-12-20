import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { 
	useBulkEditNotificationsMutation, 
} from "../services/private/notification"
import { addToast } from "../slices/toastSlice"
import { Toast, Notification } from "../types/common"
import { v4 as uuidv4 } from "uuid"


type Props = {
	notifications: Array<Notification> | undefined | null
	closeDropdown: () => void
}

export const NotificationDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, notifications}: Props, ref) => {
	const dispatch = useAppDispatch()
    const [ bulkEditNotifications, { error: bulkEditNotificationsError, isLoading: isBulkEditNotificationsLoading }] = useBulkEditNotificationsMutation()
	const markMessagesRead = async () => {
		const unreadMessages = notifications?.filter(n => !n.isRead)
		if (unreadMessages?.length){
			try {
				await bulkEditNotifications({isRead: true, ids: notifications?.map((n) => n.id) ?? []}).unwrap()
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

	return (
		<Dropdown ref = {ref}>
			<div
				className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
			>
					Notifications: 
					<button onClick={markMessagesRead} className = "button --secondary">Mark as Read</button>
			</div>
			<ul>

				{notifications?.map((notification) => (
					<li
						key={`notification-${notification.id}`}
						onClick={() => {
							console.log()
						}}
						className={`${!notification.isRead ? "tw-bg-gray-50" : ""} tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900`}
						role="menuitem"
					>
						{notification.body}
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

