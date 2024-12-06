import React, {useState} from "react"
import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { Toast, UserRegistrationRequest } from "../../types/common"
import { useBulkEditRegistrationRequestsMutation, useUpdateRegistrationRequestMutation } from "../../services/private/organization"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

export type RegistrationRequestConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
	bulkEdit: Record<string, any>
	editCol: Record<string, any>
}

export const useRegistrationRequestConfig = (
	regSelectedIds: Array<number>, 
	setRegSelectedIds: (ids: Array<number>) => void, 
	bulkEditMode: boolean
) => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	const [ updateRegistrationRequest, {isLoading: isUpdateRegLoading, error: updateRegError} ] = useUpdateRegistrationRequestMutation()
	const [ bulkEditRegistrationRequests, {isLoading: isBulkEditRegLoading, error: bulkEditRegError} ] = useBulkEditRegistrationRequestsMutation()

	const editRegRequest = async (id: number, approve: boolean) => {
		const defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: `User registration has been ${approve ? "approved!" : "denied"}`
		}
		try {
			await updateRegistrationRequest({id: id, approve: approve}).unwrap()
			dispatch(addToast(defaultToast))
		}
		catch (e) {
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Something went wrong when approving the user registration request."
			}))
		}
	}

	const bulkEditRegRequest = async (ids: Array<number>, approve: boolean) => {
		const defaultToast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: `User registrations have been ${approve ? "approved!" : "denied"}`
		}
		try {
			await bulkEditRegistrationRequests({ids: ids, approve: approve}).unwrap()
			dispatch(addToast(defaultToast))
		}
		catch (e) {
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "Something went wrong when approving the user registration requests."
			}))
		}
		// un-select all ids
		setRegSelectedIds([])
	}

	return {
		headers: {
			"firstName": "First Name", 
			"lastName": "Last Name", 
			"email": "Email", 
			"createdAt": "Registration Date",
			"approvedAt": "Approved At",
			"deniedAt": "Denied At",
			...(bulkEditMode ? {
				"approve": "",
				"deny": "",
			}: {})
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, lookup: [] },
			"approvedAt": { modifier: dateModifier, lookup: []},
			"deniedAt": { modifier: dateModifier, lookup: []},
		},
		bulkEdit: {
			isEnabled: bulkEditMode,
			getIds: () => {
				return regSelectedIds
			},
			updateIds: (ids: Array<number>) => {
				setRegSelectedIds(ids)
			},
			onClick: (id: number) => {
				if (regSelectedIds.includes(id)){
					setRegSelectedIds(regSelectedIds.filter((itemId) => id !== itemId))
				}
				else {
					setRegSelectedIds([...regSelectedIds, id])
				}
			},
			approveAll: () => {
				bulkEditRegRequest(regSelectedIds, true)
			},
			denyAll: () => {
				bulkEditRegRequest(regSelectedIds, false)
			},
			canSelect: (userReg: UserRegistrationRequest) => {
				return !userReg.approvedAt && !userReg.deniedAt
			},
			filter: (data: Array<UserRegistrationRequest>) => {
				return data?.filter((userReg) => !userReg.approvedAt && !userReg.deniedAt)
			},
		},
		editCol: {
			col: "approve", 
			text: "Approve", 
			shouldShow: (data: UserRegistrationRequest) => {
				return !data.approvedAt && !data.deniedAt
			},
			onClick: (id: number) => {
				editRegRequest(id, true)
			}
		},
		deleteCol: {
			col: "deny",
			text: "Deny",
			shouldShow: (data: UserRegistrationRequest) => {
				return !data.approvedAt && !data.deniedAt
			},
			onClick: (id: number) => {
				editRegRequest(id, false)
			}
		}
	}
}
