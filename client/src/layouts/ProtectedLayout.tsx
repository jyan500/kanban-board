import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { TopNav } from "../components/TopNav" 
import { useGetUserProfileQuery } from "../services/private/userProfile" 
import { useGetStatusesQuery } from "../services/private/status" 
import { useGetTicketTypesQuery } from "../services/private/ticketType" 
import { useGetPrioritiesQuery } from "../services/private/priority" 
import { setUserProfile } from "../slices/userProfileSlice" 
import { setStatuses } from "../slices/statusSlice" 
import { setTicketTypes } from "../slices/ticketTypeSlice" 
import { setPriorities } from "../slices/prioritySlice"

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData, isFetching: isUserProfileFetching, isError: isUserProfileError } = useGetUserProfileQuery() 
    const {data: statusData} = useGetStatusesQuery()
    const {data: ticketTypesData} = useGetTicketTypesQuery()
    const {data: priorityData} = useGetPrioritiesQuery()

    useEffect(() => {
        // Retrieve user on startup
        if (token){
        	if (userProfileData){
	        	dispatch(setUserProfile({userProfile: userProfileData}))
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
        }
    }, [userProfileData, ticketTypesData, statusData, priorityData]);

	if (!token){
		return <Navigate replace to = {"/login"}/>
	}
	
	return (
		<div>
			<SideBar isFetching={isUserProfileFetching}/>
			<TopNav isFetching={isUserProfileFetching}/>
			<Outlet/>
		</div>
	)
}

export default ProtectedLayout

