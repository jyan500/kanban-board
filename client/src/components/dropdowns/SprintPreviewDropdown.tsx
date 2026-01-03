import React, { useState, useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { Toast, Ticket, Sprint, Status, UserProfile } from "../../types/common"
import type { CalendarData } from "../../pages/boards/BoardCalendar"
import { CgProfile } from "react-icons/cg"
import { Avatar } from "../page-elements/Avatar"
import { IconEye } from "../icons/IconEye";
import { IconEyeSlash } from "../icons/IconEyeSlash";
import { 
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation, 
} from "../../services/private/ticket"
import { useAddNotificationMutation } from "../../services/private/notification"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { getUserInitials, displayUser } from "../../helpers/functions"
import { FiPlus as PlusIcon } from "react-icons/fi";
import { IconPlus } from "../icons/IconPlus"
import { TICKETS } from "../../helpers/routes"
import { LoadingSpinner } from "../LoadingSpinner"

type Props = {
	closeDropdown: () => void
    sprint: CalendarData
	isMobile?: boolean
}

export const SprintPreviewDropdown = React.forwardRef<HTMLDivElement, Props>(({isMobile, closeDropdown, sprint}: Props, ref) => {
	return (
		<Dropdown alignLeft={true} className = "tw-top-4" isMobile = {isMobile} ref = {ref}>
            <div>Sprint Preview Dropdown Here</div>
		</Dropdown>
	)	
})

