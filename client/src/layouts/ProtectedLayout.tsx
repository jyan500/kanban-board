import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { Modal } from "../components/Modal" 
import { TopNav } from "../components/page-elements/TopNav" 
import { Footer } from "../components/page-elements/Footer"
import { useGetUserProfileQuery, useGetUserProfilesQuery } from "../services/private/userProfile" 
import { useGetStatusesQuery } from "../services/private/status" 
import { useGetTicketTypesQuery } from "../services/private/ticketType" 
import { useGetTicketRelationshipTypesQuery } from "../services/private/ticketRelationshipType"
import { useGetPrioritiesQuery } from "../services/private/priority" 
import { useGetUserRolesQuery } from "../services/private/userRole" 
import { setUserProfile, setUserProfiles } from "../slices/userProfileSlice" 
import { setUserRoles, setUserRoleLookup } from "../slices/userRoleSlice" 
import { setStatuses } from "../slices/statusSlice" 
import { setTicketTypes } from "../slices/ticketTypeSlice" 
import { setTicketRelationshipTypes } from "../slices/ticketRelationshipTypeSlice"
import { setPriorities } from "../slices/prioritySlice"
import { UserRole } from "../types/common" 

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData, isFetching: isUserProfileFetching, isError: isUserProfileError } = useGetUserProfileQuery() 
    const {data: userProfilesData, isFetching: isUserProfilesFetching, isError: isUserProfilesError } = useGetUserProfilesQuery() 
    const {data: statusData} = useGetStatusesQuery()
    const {data: ticketTypesData} = useGetTicketTypesQuery()
    const {data: ticketRelationshipTypeData} = useGetTicketRelationshipTypesQuery()
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
	        if (ticketRelationshipTypeData) {
	        	dispatch(setTicketRelationshipTypes({ticketRelationshipTypes: ticketRelationshipTypeData}))
	        }
	        if (statusData){
	        	dispatch(setStatuses({statuses: statusData}))
	        }
	        if (priorityData){
	        	dispatch(setPriorities({priorities: priorityData}))
	        }
	        if (userRoleData){
	        	dispatch(setUserRoles({userRoles: userRoleData}))
	        	const userRoleLookup: {[id: number]: string} = userRoleData.reduce((acc: {[id: number]: string}, obj: UserRole) => {
        			acc[obj.id] = obj.name
        			return acc
	        	}, {})
	        	dispatch(setUserRoleLookup(userRoleLookup))
	        }
        }
    }, [userProfileData, ticketTypesData, statusData, priorityData]);

	if (!token){
		return <Navigate replace to = {"/login"} state={{alert: "You have been logged out"}}/>
	}
	
	return (
		<div>
			<SideBar isFetching={isUserProfileFetching}/>
			<div className = "tw-px-16 tw-w-full tw-min-h-screen">
				<TopNav isFetching={isUserProfileFetching}/>
				<Outlet/>
			</div>
			<Footer/>
			<Modal/>
		</div>
	)
}

export default ProtectedLayout

