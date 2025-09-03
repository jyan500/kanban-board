import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal, setModalProps } from "../../slices/modalSlice" 
import { UserProfile } from "../../types/common"
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { OverlappingRow } from "../../components/OverlappingRow"
import { displayUser, getUserInitials } from "../../helpers/functions"

export type BoardConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
}

export const useBoardConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"name": "Name", 
			"numTickets": "Tickets", 
			"assignees": "Assignees", 
			"lastModified": "Last Modified", 
			...(isAdminOrBoardAdmin ? {"edit": ""} : {})},
		linkCol: "name",
		link: (id: string) => `/boards/${id}`,
		renderers: {
			assignees: (userProfiles: Array<Pick<UserProfile, "firstName" | "lastName" | "imageUrl">> | null | undefined) => {
				return {
					component: OverlappingRow,
					props: {
						imageUrls: userProfiles?.map((profile) => ({name: displayUser(profile), imageUrl: profile.imageUrl, initials: getUserInitials(profile)})) ?? [],
						imageSize: "m",
					}
				}
			}
		},
		modifiers: {
			"lastModified": { modifier: dateModifier, object: [] },
		},
		...(isAdminOrBoardAdmin ? {editCol: {col: "edit", text: "Edit", onClick: (id: number) => {
			dispatch(setModalType("BOARD_FORM"))
			dispatch(setModalProps({boardId: id}))
			dispatch(toggleShowModal(true))
		}}} : {}),
	}
}