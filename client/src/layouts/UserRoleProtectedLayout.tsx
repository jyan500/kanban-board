import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 

const UserRoleProtectedLayout = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { organizations } = useAppSelector((state) => state.org)
	const isAdminOrBoardAdmin = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")

	if (!isAdminOrBoardAdmin){
		return <Navigate replace to = {"/"} state={{alert: "You don't have permission to access this page"}}/>
	}

	return (
		<>
			<Outlet/>
		</>
	)
}

export default UserRoleProtectedLayout
