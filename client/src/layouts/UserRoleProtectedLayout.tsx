import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 
import { LoadingSpinner } from "../components/LoadingSpinner"
import { useGetUserRolesQuery } from "../services/private/userRole"
import { useGetUserProfileQuery } from "../services/private/userProfile"

const UserRoleProtectedLayout = () => {
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [isLoading, setIsLoading] = useState(true)
	const [isAdmin, setIsAdmin] = useState(false)

	useEffect(() => {
		if (userRoleLookup && userProfile){
			const isAdmin = userRoleLookup[userProfile.userRoleId] === "ADMIN"
			setIsAdmin(isAdmin)
			setIsLoading(false)
		}
	}, [userRoleLookup, userProfile])

	if (!isLoading && !isAdmin){
		return <Navigate replace to = {"/"} state={{alert: "You don't have permission to access this page"}}/>
	}
	else if (!isLoading && isAdmin){
		return <><Outlet/></>
	}
	return <></>
}

export default UserRoleProtectedLayout
