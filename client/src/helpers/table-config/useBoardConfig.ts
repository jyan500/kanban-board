import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 

export type BoardConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
}

export const useBoardConfig = () => {
	const { userProfiles } = useAppSelector((state) => state.userProfile)
	const dispatch = useAppDispatch()
	return {
		headers: {"name": "Name", "numTickets": "Tickets", "assignees": "Assignees", "lastModified": "Last Modified", "edit": ""},
		linkCol: "name",
		link: (id: string) => `/boards/${id}`,
		modifiers: {
			"assignees": { modifier: userProfileModifier, object: userProfiles },
			"lastModified": { modifier: dateModifier, object: [] },
		},
		editCol: {col: "edit", text: "Edit", onClick: (id: number) => {
			dispatch(setModalType("BOARD_FORM"))
			dispatch(setCurrentBoardId(id))
			dispatch(toggleShowModal(true))
		}},
	}
}