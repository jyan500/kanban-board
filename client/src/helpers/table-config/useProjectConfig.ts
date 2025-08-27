import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import { setModalType, toggleShowModal } from "../../slices/modalSlice" 
import { UserProfile } from "../../types/common"
import { setCurrentBoardId } from "../../slices/boardInfoSlice" 
import { displayUser, getUserInitials } from "../../helpers/functions"
import { Avatar } from "../../components/page-elements/Avatar"
import { InnerProjectBoardsTable } from "../../components/projects/InnerProjectBoardsTable"

export const useProjectConfig = () => {
	const { userProfiles, userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const dispatch = useAppDispatch()
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	return {
		headers: {
			"imageUrl": "",
			"name": "Name", 
			"description": "Description",
			"createdAt": "Created At",
			"showBoards": "",
			...(isAdminOrBoardAdmin ? {"edit": ""} : {})
		},
		renderers: {
			imageUrl: (url: string) => {
				return {
					component: Avatar,
					props: {
						imageUrl: url,
						size: "m",	
						className: "tw-rounded-full",
					}
				}
			}
		},
		nestedTableControl: {
			col: "showBoards",
			text: "Boards"
		},
		nestedTable: {
			component: InnerProjectBoardsTable,
			idKey: "projectId"
		},
		modifiers: {
			"createdAt": { modifier: dateModifier, object: [] },
		},
		...(isAdminOrBoardAdmin ? {editCol: {col: "edit", text: "Edit", onClick: (id: number) => {
		}}} : {}),
	}
}