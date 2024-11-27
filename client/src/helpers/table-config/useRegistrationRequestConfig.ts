import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { Toast, UserRegistrationRequest } from "../../types/common"
import { toggleToolbar, updateIds, toggleSelectAll } from "../../slices/bulkEditSlice"
import { useBulkEditRegistrationRequestsMutation, useUpdateRegistrationRequestMutation } from "../../services/private/organization"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

export type RegistrationRequestConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
	bulkEdit: Record<string, any>
	editCol: Record<string, any>
}

export const useRegistrationRequestConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ids: itemIds, selectAll } = useAppSelector((state) => state.bulkEdit) 
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	const [ updateRegistrationRequest, {isLoading: isUpdateRegLoading, error: updateRegError} ] = useUpdateRegistrationRequestMutation()
	const [ bulkEditRegistrationRequests, {isLoading: isBulkEditRegLoading, error: bulkEditRegError} ] = useBulkEditRegistrationRequestsMutation()
	return {
		headers: {
			"firstName": "First Name", 
			"lastName": "Last Name", 
			"email": "Email", 
			"createdAt": "Registration Date",
			"approve": "",
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, lookup: [] },
		},
		bulkEdit: {
			isEnabled: true,
			onClickAll: (ids: Array<number>) => {
				dispatch(updateIds(ids))
			},
			onClick: (id: number) => {
				if (itemIds.includes(id)){
					dispatch(updateIds(itemIds.filter((itemId) => id !== itemId)))
				}
				else {
					dispatch(updateIds([...itemIds, id]))
				}
			},
			approveAll: async () => {
				const defaultToast: Toast = {
					id: uuidv4(),
					type: "success",
					animationType: "animation-in",
					message: "User registrations have been approved!"
				}
				try {
					await bulkEditRegistrationRequests(itemIds).unwrap()
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
				dispatch(updateIds([]))
			}
		},
		editCol: {
			col: "approve", 
			text: "Approve", 
			onClick: async (id: number) => {
				const defaultToast: Toast = {
					id: uuidv4(),
					type: "success",
					animationType: "animation-in",
					message: "User registration has been approved!"
				}
				try {
					await updateRegistrationRequest(id).unwrap()
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
		},
	}
}