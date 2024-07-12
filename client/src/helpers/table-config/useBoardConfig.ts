import { userProfileModifier, dateModifier } from "../table-modifiers/display-modifiers"
import { useAppSelector } from "../../hooks/redux-hooks" 

export type BoardConfigType = {
	headers: Record<string, any>,
	modifiers: Record<string, any>
}

export const useBoardConfig = () => {
	const { userProfiles } = useAppSelector((state) => state.userProfile)
	return {
		headers: {"name": "Name", "numTickets": "Tickets", "assignees": "Assignees", "lastModified": "Last Modified"},
		linkRow: "name",
		link: (id: string) => `/boards/${id}`,
		modifiers: {
			"assignees": { modifier: userProfileModifier, object: userProfiles },
			"lastModified": { modifier: dateModifier, object: [] },
		}
	}
}