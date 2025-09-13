import { userProfileModifier, dateModifier, booleanModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal, setModalProps } from "../../slices/modalSlice" 
import { UserProfile, Sprint } from "../../types/common"
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { OverlappingRow } from "../../components/OverlappingRow"
import { displayUser, getUserInitials } from "../../helpers/functions"

export const useBoardSprintConfig = (boardId: number) => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"name": "Name", 
			"startDate": "Start Date",
			"endDate": "End Date",
			"isCompleted": "Completed",
			"numCompletedTickets": "Completed Tickets", 
			"numOpenTickets": "Open Tickets", 
			"createdAt": "Last Modified", 
			...(isAdminOrBoardAdmin ? {"edit": ""} : {}),
		},
		modifiers: {
			"isCompleted": { modifier: booleanModifier, object: []},
			"startDate": { modifier: dateModifier, object: []},
			"endDate": { modifier: dateModifier, object: []},
			"createdAt": { modifier: dateModifier, object: [] },
		},
		...(isAdminOrBoardAdmin ? {editCol: {col: "edit", text: "Edit", onClick: (id: number) => {
			dispatch(setModalType("SPRINT_FORM"))
			dispatch(setModalProps({sprintId: id, boardId: boardId}))
			dispatch(toggleShowModal(true))
		}}} : {}),

	}
}