import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Link, Outlet, Navigate, useParams } from "react-router-dom" 
import { LoadingSpinner } from "../components/LoadingSpinner"
import { useGetUserProfileQuery } from "../services/private/userProfile"
import { setUserProfile } from "../slices/userProfileSlice"
import { UserRole } from "../types/common"
import { LOGIN, TEMP, ACCOUNT, HOME } from "../helpers/routes"
import { Footer } from "../components/page-elements/Footer"
import { TopNav } from "../components/page-elements/TopNav"

const TempLoginProtectedLayout = () => {
	const {token, isTemp} = useAppSelector((state) => state.auth)	
	const dispatch = useAppDispatch()
	const { data: userProfile, isLoading: isUserProfileLoading } = useGetUserProfileQuery()

	useEffect(() => {
        // Retrieve user on startup
        if (token){
        	if (userProfile){
	        	dispatch(setUserProfile({userProfile: userProfile}))
	        }
        }
    }, [token, userProfile]);

	if (!token){
		return <Navigate replace to = {LOGIN}/>
	}
	if (isTemp){
		return (
			<div className = "tw-relative tw-min-h-screen tw-max-h-screen tw-flex tw-flex-col tw-gap-y-4">
				<div className = "tw-p-4 md:tw-px-16 tw-w-full tw-h-full tw-overflow-y-auto tw-pb-36">
					<TopNav/>
					<div className = "tw-space-y-2">
						<Outlet/>
					</div>
				</div>
			</div>	
		)
	}
	return <Navigate replace to = {HOME}/>
}

export default TempLoginProtectedLayout
