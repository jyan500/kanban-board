import React, {useState} from "react"
import { userProfileModifier, dateModifier, nameModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { Toast, Ticket  } from "../../types/common"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

export type RegistrationRequestConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
	bulkEdit: Record<string, any>
}

export const useBoardTicketConfig = (
	bulkEditMode: boolean,
	selectedIds: Array<number>,
	setSelectedIds: (ids: Array<number>) => void
) => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")

	return {
		headers: {
			"name": "Name", 
			"statusId": "Status", 
			"ticketTypeId": "Ticket Type", 
			"priorityId": "Priority", 
			"assignees": "Assignee",
			"createdAt": "Created At",
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, lookup: [] },
			"priorityId": { modifier: nameModifier, lookup: priorities},
			"statusId": { modifier: nameModifier, lookup: statuses},
			"ticketTypeId": { modifier: nameModifier, lookup: ticketTypes},
			"assignees": { modifier: userProfileModifier, lookup: []}
		},
		bulkEdit: {
			isEnabled: bulkEditMode,
			canSelect: (ticket: Ticket) => {
				return true 
			},
			onClick: (id: number) => {
				if (selectedIds.includes(id)){
					setSelectedIds(selectedIds.filter((itemId) => id !== itemId))
				}
				else {
					setSelectedIds([...selectedIds, id])
				}
			},
			getIds: () => {
				return selectedIds
			},
			updateIds: (ids: Array<number>) => {
				setSelectedIds(ids)
			},
			filter: (data: Array<Ticket>) => {
				return data
			}
		},
	}
}
