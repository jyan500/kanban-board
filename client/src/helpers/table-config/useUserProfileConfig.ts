import { userRoleModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { Toast, UserRegistrationRequest } from "../../types/common"
import { useBulkEditRegistrationRequestsMutation, useUpdateRegistrationRequestMutation } from "../../services/private/organization"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { Avatar } from "../../components/page-elements/Avatar"

export type useUserProfileConfigType = {
	headers: Record<string, any>
	modifiers: Record<string, any>
	renderers: Record<string, any>
	bulkEdit: Record<string, any>
	editCol: Record<string, any>
}

export const useUserProfileConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"imageUrl": "",
			"firstName": "First Name", 
			"lastName": "Last Name", 
			"email": "Email", 
			"userRoleId": "User Role",
			"edit": "",
		},
		modifiers: {
			"userRoleId": { modifier: userRoleModifier, lookup: userRoleLookup },
		},
		renderers: {
			imageUrl: ({url, initials}: {url: string, initials: string}) => {
				return {
					component: Avatar,
					props: {
						imageUrl: url,
						size: "m",	
						className: "tw-rounded-full",
						userInitials: initials,
					}
				}
			}
		},
		editCol: {
			col: "edit", 
			text: "Edit", 
			onClick: async (id: number) => {
				dispatch(setModalType("USER_FORM"))
				dispatch(setModalProps({userId: id}))
				dispatch(toggleShowModal(true))
			}
		},
	}
}
