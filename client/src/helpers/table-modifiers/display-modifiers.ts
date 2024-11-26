import { UserProfile } from "../../types/common"
import { displayUser } from "../../helpers/functions"
// replace list of user ids with a string of all users' first and last names
export const userProfileModifier = (row: Array<Pick<UserProfile, "firstName" | "lastName">>) => {
	return row?.length ? row?.reduce((acc: Array<string>, r: Pick<UserProfile, "firstName" | "lastName">) => {
		acc.push(displayUser(r))
		return acc
	}, []).join(", ") : ""
}

// convert UTC timestamp from backend to date format for display
export const dateModifier = (date: string) => {
	return new Date(date).toLocaleDateString()	
}