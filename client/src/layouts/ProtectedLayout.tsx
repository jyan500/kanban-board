import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { TopNav } from "../components/TopNav" 
import { useGetUserProfileQuery } from "../services/userProfile" 
import { setUserProfile } from "../slices/userProfileSlice" 

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData} = useGetUserProfileQuery() 

    useEffect(() => {
        // Retrieve user on startup
        if (token && userProfileData){
        	dispatch(setUserProfile({userProfile: userProfileData}))
        }
    }, []);

	if (!token){
		return <Navigate replace to = {"/login"}/>
	}
	
	return (
		<div>
			<SideBar/>
			<TopNav/>
			<Outlet/>
		</div>
	)
}

export default ProtectedLayout

