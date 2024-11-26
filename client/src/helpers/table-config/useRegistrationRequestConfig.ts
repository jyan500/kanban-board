import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 

export type RegistrationRequestConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
}

export const useRegistrationRequestConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"firstName": "First Name", 
			"lastName": "Last Name", 
			"email": "Email", 
			"createdAt": "Registration Date",
			"approve": "",
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, object: [] },
		},
		editCol: {
			col: "approve", 
			text: "Approve", 
			onClick: (id: number) => {
				console.log("approval for the user registration: ", id)	
			}
		},
	}
}