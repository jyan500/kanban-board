import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 
import { LoadingSpinner } from "../components/LoadingSpinner"
import { useGetUserRolesQuery } from "../services/private/userRole"
import { useGetUserProfileQuery } from "../services/private/userProfile"
import { UserRole } from "../types/common"

const UserRoleProtectedLayout = () => {
	const { data: userRoles, isLoading: isUserRolesLoading } = useGetUserRolesQuery()
	const { data: userProfile, isLoading: isUserProfileLoading } = useGetUserProfileQuery()
	const [isLoading, setIsLoading] = useState(true)
	const [isAdmin, setIsAdmin] = useState(false)

	useEffect(() => {
		if (!isUserProfileLoading && !isUserRolesLoading){
			const admin = userRoles?.find((role) => role.name === "ADMIN")
			const isAdmin = userProfile && admin?.id === userProfile.userRoleId
			setIsAdmin(isAdmin ?? false)
			setIsLoading(false)
		}
	}, [isUserProfileLoading, isUserRolesLoading])
	if (isLoading){
		return <></>
	}
	return !isAdmin ? <Navigate replace to = {"/"} state={{alert: "You don't have permission to access this page"}}/> : (<><Outlet/></>)
}

export default UserRoleProtectedLayout
