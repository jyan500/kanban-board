import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 
import { LoadingSpinner } from "../components/LoadingSpinner"
import { useGetUserProfileQuery } from "../services/private/userProfile"
import { UserRole } from "../types/common"
import { ACCOUNT } from "../helpers/routes"

const UserActivatedProtectedLayout = () => {
	const { data: userProfile, isLoading: isUserProfileLoading } = useGetUserProfileQuery()
	const [isLoading, setIsLoading] = useState(true)
	const [isActivated, setIsActivated] = useState(false)

	useEffect(() => {
		if (!isUserProfileLoading){
			setIsActivated(userProfile?.isActive ?? false)
			setIsLoading(false)
		}
	}, [isUserProfileLoading])
	if (isLoading){
		return <></>
	}
	return !isActivated ? <Navigate replace to = {ACCOUNT} state={{type: "failure", alert: "You don't have permission to access this page"}}/> : (<><Outlet/></>)
}

export default UserActivatedProtectedLayout
