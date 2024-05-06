import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { TopNav } from "../components/TopNav" 
import { useGetUserProfileQuery } from "../services/private/userProfile" 
import { setUserProfile } from "../slices/userProfileSlice" 

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData, isFetching} = useGetUserProfileQuery() 

    useEffect(() => {
        // Retrieve user on startup
        if (token && userProfileData){
        	dispatch(setUserProfile({userProfile: userProfileData}))
        }
    }, [userProfileData]);

	if (!token){
		return <Navigate replace to = {"/login"}/>
	}
	
	return (
		<div>
			<SideBar isFetching={isFetching}/>
			<TopNav isFetching={isFetching}/>
			<Outlet/>
		</div>
	)
}

export default ProtectedLayout

