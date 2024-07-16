import { UserProfile } from "../../types/common"
// replace list of user ids with a string of all users' first and last names
export const userProfileModifier = (idList: Array<number>, userList: Array<UserProfile>) => {
	return idList?.map((id) => {
		const user = userList?.find((obj) => id === obj.id)
		return user ? `${user.firstName} ${user.lastName}` : ""
	}).filter((s) => s !== "").join(", ")	
}

// convert UTC timestamp from backend to date format for display
export const dateModifier = (date: string) => {
	return new Date(date).toLocaleDateString()	
}