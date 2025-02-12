import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { NOTIFICATIONS } from "../../helpers/routes"

type Props = {
	closeDropdown: () => void
	statusId: number
	addTicketHandler: (statusId: number) => void
	hideStatusHandler: (statusId: number) => void
}

export const StatusHeaderDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, statusId, addTicketHandler, hideStatusHandler}: Props, ref) => {
	const dispatch = useAppDispatch()

	const options = {
		"Add Ticket": () => {
			addTicketHandler(statusId)
		},
		"Set Column Limit": () => {
			console.log("Placeholder for set limit")
		},
		"Hide Column": () => {
			hideStatusHandler(statusId)
		},
	}

	return (
		<Dropdown ref = {ref}>
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

