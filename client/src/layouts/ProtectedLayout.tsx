import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { Modal } from "../components/Modal" 
import { SecondaryModal } from "../components/SecondaryModal" 
import { LoadingSpinner } from "../components/LoadingSpinner"
import { TopNav } from "../components/page-elements/TopNav" 
import { Footer } from "../components/page-elements/Footer"
import { useGetUserProfileQuery } from "../services/private/userProfile" 
import { useGetStatusesQuery } from "../services/private/status" 
import { useGetTicketTypesQuery } from "../services/private/ticketType" 
import { useGetTicketRelationshipTypesQuery } from "../services/private/ticketRelationshipType"
import { useGetPrioritiesQuery } from "../services/private/priority" 
import { useGetNotificationTypesQuery } from "../services/private/notificationType"
import { useGetUserRolesQuery } from "../services/private/userRole" 
import { setUserProfile, setUserProfiles } from "../slices/userProfileSlice" 
import { setUserRoles, setUserRoleLookup } from "../slices/userRoleSlice" 
import { setStatuses } from "../slices/statusSlice" 
import { setTicketTypes } from "../slices/ticketTypeSlice" 
import { setTicketRelationshipTypes } from "../slices/ticketRelationshipTypeSlice"
import { setPriorities } from "../slices/prioritySlice"
import { setNotificationTypes } from "../slices/notificationTypeSlice"
import { UserRole } from "../types/common" 

const ProtectedLayout = () => {
	const token = useAppSelector((state) => state.auth.token)	
	const dispatch = useAppDispatch()
    const {data: userProfileData, isFetching: isUserProfileFetching, isError: isUserProfileError } = useGetUserProfileQuery() 
    const {data: statusData, isLoading: isStatusDataLoading} = useGetStatusesQuery({})
    const {data: ticketTypesData, isLoading: isTicketTypesDataLoading} = useGetTicketTypesQuery()
    const {data: ticketRelationshipTypeData, isLoading: isTicketRelationshipTypeLoading} = useGetTicketRelationshipTypesQuery()
    const {data: priorityData, isLoading: isPriorityDataLoading} = useGetPrioritiesQuery()
    const {data: userRoleData, isLoading: isUserRoleDataLoading } = useGetUserRolesQuery()
    const {data: notificationTypeData, isLoading: isNotificationTypeDataLoading } = useGetNotificationTypesQuery()
    const gutter = {margin: "var(--s-spacing)"}

    const isDataLoaded = !(
    	isUserProfileFetching && 
    	isStatusDataLoading && 
    	isTicketTypesDataLoading && 
    	isTicketRelationshipTypeLoading && 
    	isPriorityDataLoading && 
    	isUserRoleDataLoading && 
    	isNotificationTypeDataLoading
    )

    useEffect(() => {
        // Retrieve user on startup
        if (token){
        	if (userProfileData){
	        	dispatch(setUserProfile({userProfile: userProfileData}))
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
	        if (notificationTypeData){
	        	dispatch(setNotificationTypes({notificationTypes: notificationTypeData}))
	        }
        }
    }, [token, userProfileData, ticketTypesData, statusData, priorityData, notificationTypeData]);

	if (!token){
		return <Navigate replace to = {"/login"} state={{alert: "You have been logged out"}}/>
	}
	
	return (
		<div>
			<SideBar/>
			<div className = "tw-flex tw-flex-col tw-gap-y-4">
				<div className = "tw-px-4 md:tw-px-16 tw-w-full tw-min-h-screen">
					<TopNav/>
					{isDataLoaded ? (
						<Outlet/>
					): null}
				</div>
				<Footer/>
			</div>
			<Modal/>
			<SecondaryModal/>
		</div>
	)
}

export default ProtectedLayout

