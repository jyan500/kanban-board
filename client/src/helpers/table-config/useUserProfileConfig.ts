import { userRoleModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { Toast, UserRegistrationRequest } from "../../types/common"
import { toggleToolbar, updateIds, toggleSelectAll } from "../../slices/bulkEditSlice"
import { useBulkEditRegistrationRequestsMutation, useUpdateRegistrationRequestMutation } from "../../services/private/organization"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

export type useUserProfileConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
	bulkEdit: Record<string, any>
	editCol: Record<string, any>
}

export const useUserProfileConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { ids: itemIds, selectAll } = useAppSelector((state) => state.bulkEdit) 
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"firstName": "First Name", 
			"lastName": "Last Name", 
			"email": "Email", 
			"userRoleId": "User Role",
			"editRole": "",
		},
		modifiers: {
			"userRoleId": { modifier: userRoleModifier, object: userRoleLookup },
		},
		bulkEdit: {
			isEnabled: true,
			// onClickAll: (ids: Array<number>) => {
			// 	dispatch(updateIds(ids))
			// },
			// onClick: (id: number) => {
			// 	if (itemIds.includes(id)){
			// 		dispatch(updateIds(itemIds.filter((itemId) => id !== itemId)))
			// 	}
			// 	else {
			// 		dispatch(updateIds([...itemIds, id]))
			// 	}
			// },
			// approveAll: async () => {
			// 	const defaultToast: Toast = {
			// 		id: uuidv4(),
			// 		type: "success",
			// 		animationType: "animation-in",
			// 		message: "User registrations have been approved!"
			// 	}
			// 	try {
			// 		await bulkEditRegistrationRequests(itemIds).unwrap()
			// 		dispatch(addToast(defaultToast))
			// 	}
			// 	catch (e) {
			// 		dispatch(addToast({
			// 			...defaultToast,
			// 			type: "failure",
			// 			message: "Something went wrong when approving the user registration requests."
			// 		}))
			// 	}
			// 	// un-select all ids
			// 	dispatch(updateIds([]))
			// }
		},
		editCol: {
			col: "editRole", 
			text: "Edit Role", 
			onClick: async (id: number) => {
				console.log("editing role")
			}
		},
	}
}