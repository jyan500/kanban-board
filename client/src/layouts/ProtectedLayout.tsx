import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { TopNav } from "../components/TopNav" 
import { useGetUserProfileQuery, useGetUserProfilesQuery } from "../services/private/userProfile" 
import { useGetStatusesQuery } from "../services/private/status" 
import { useGetTicketTypesQuery } from "../services/private/ticketType" 
import { useGetPrioritiesQuery } from "../services/private/priority" 
import { useGetUserRolesQuery } from "../services/private/userRole" 
import { setUserProfile, setUserProfiles } from "../slices/userProfileSlice" 
import { setUserRoles } from "../slices/userRoleSlice" 
import { setStatuses } from "../slices/statusSlice" 
import { setTicketTypes } from "../slices/ticketTypeSlice" 
import { setPriorities } from "../slices/prioritySlice"

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData, isFetching: isUserProfileFetching, isError: isUserProfileError } = useGetUserProfileQuery() 
    const {data: userProfilesData, isFetching: isUserProfilesFetching, isError: isUserProfilesError } = useGetUserProfilesQuery() 
    const {data: statusData} = useGetStatusesQuery()
    const {data: ticketTypesData} = useGetTicketTypesQuery()
    const {data: priorityData} = useGetPrioritiesQuery()
    const {data: userRoleData } = useGetUserRolesQuery()
    const gutter = {margin: "var(--s-spacing)"}

    useEffect(() => {
        // Retrieve user on startup
        if (token){
        	if (userProfileData){
	        	dispatch(setUserProfile({userProfile: userProfileData}))
	        }
	        // get all user profiles
        	if (userProfilesData){
	        	dispatch(setUserProfiles({userProfiles: userProfilesData}))
	        }
	        if (ticketTypesData){
	        	dispatch(setTicketTypes({ticketTypes: ticketTypesData}))	
	        }
	        if (statusData){
	        	dispatch(setStatuses({statuses: statusData}))
	        }
	        if (priorityData){
	        	dispatch(setPriorities({priorities: priorityData}))
	        }
	        if (userRoleData){
	        	dispatch(setUserRoles({userRoles: userRoleData}))
	        }
        }
    }, [userProfileData, ticketTypesData, statusData, priorityData]);

	if (!token){
		return <Navigate replace to = {"/login"} state={{alert: "You have been logged out"}}/>
	}
	
	return (
		<div>
			<SideBar isFetching={isUserProfileFetching}/>
			<TopNav isFetching={isUserProfileFetching}/>
			<div style={gutter}>
				<Outlet/>
			</div>
		</div>
	)
}

export default ProtectedLayout

