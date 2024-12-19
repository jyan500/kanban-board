import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { Dropdown } from "./Dropdown" 
import { Notification } from "../types/common"

type Props = {
	notifications: Array<Notification> | undefined | null
	closeDropdown: () => void
}

export const NotificationDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, notifications}: Props, ref) => {
	return (
		<Dropdown ref = {ref}>
			<div
				className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
			>
					Notifications: 
			</div>
			<ul>

				{notifications?.map((notification) => (
					<li
						key={`notification-${notification.id}`}
						onClick={() => {
							console.log()
						}}
						className="tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
						role="menuitem"
					>
						{notification.body}
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

