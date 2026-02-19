import React, {useEffect} from "react"
import { Link, Outlet, Navigate } from "react-router-dom" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SideBar } from "../components/SideBar"
import { Modal } from "../components/Modal" 
import { BottomBulkEditToolbar } from "../components/page-elements/BottomBulkEditToolbar"
import { SecondaryModal } from "../components/SecondaryModal" 
import { LoadingSkeleton } from "../components/page-elements/LoadingSkeleton"
import { BoardPlaceholder } from "../components/placeholders/BoardPlaceholder"
import { LoadingSpinner } from "../components/LoadingSpinner"
import { TopNav } from "../components/page-elements/TopNav" 
import { Footer } from "../components/page-elements/Footer"
import { AccountActivationBanner } from "../components/page-elements//AccountActivationBanner"
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
import { TEMP, ACCOUNT, LOGIN } from "../helpers/routes"
import { BulkEditToolbarProvider } from "../contexts/BulkEditToolbarContext"
import { useDarkMode } from "../hooks/useDarkMode"
import { setDarkMode } from "../slices/darkModeSlice"

const ProtectedLayout = () => {
	const {token, isTemp} = useAppSelector((state) => state.auth)	
	const { isDarkMode } = useAppSelector((state) => state.darkMode)
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


	// use effect hook for dark mode
	useDarkMode("protected-main", isDarkMode)

    useEffect(() => {
        // Retrieve user on startup
        if (token){
        	if (userProfileData){
	        	dispatch(setUserProfile({userProfile: userProfileData}))
				dispatch(setDarkMode({isDarkMode: userProfileData.isDarkMode ?? false}))
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
		return <Navigate replace to = {LOGIN}/>
	}
	if (isTemp){
		return <Navigate replace to = {`${TEMP}${ACCOUNT}`}/>
	}
	
	return (
		<BulkEditToolbarProvider>
			<div className = "dark:tw-bg-dark-mode-gradient tw-flex tw-h-full" id = "protected-main">
				<SideBar/>
				{/* 
				set max height as the screen to force scroll within the boundaries of the screen. This is to avoid issues with the sidebar
				"jumping" on mobile browsers, since on mobile, the browser header disappears when you scroll past the screen height,
				which alters the height calculation for the sidebar
				*/}
				<div className = "tw-flex tw-flex-col tw-gap-y-4 tw-flex-1 tw-min-w-0 tw-min-h-screen tw-max-h-screen">
					<div className = "tw-relative tw-px-4 md:tw-px-16 tw-w-full tw-h-full tw-overflow-y-auto tw-pb-48">
						<TopNav/>
						{isDataLoaded ? (
							<div className = "tw-space-y-2">
								<Outlet/>
							</div>
						): 
						<LoadingSkeleton
						>
							<BoardPlaceholder/>	
						</LoadingSkeleton>}
					</div>
					<div className = "tw-fixed tw-bottom-0 tw-w-full">
						<Footer/>
					</div>
				</div>
				<Modal/>
				<SecondaryModal/>
				<BottomBulkEditToolbar/>
			</div>
		</BulkEditToolbarProvider>
	)
}

export default ProtectedLayout

