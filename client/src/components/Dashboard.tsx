import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import "../styles/dashboard.css"
import { useNavigate, useLocation, Link } from "react-router-dom" 
import { useGetUserOrganizationsQuery, useSwitchUserOrganizationMutation } from "../services/private/userProfile"
import { useGetTicketsQuery } from "../services/private/ticket"
import { Ticket, Organization, Toast, OptionType } from "../types/common"
import { setCredentials } from "../slices/authSlice"
import { logout } from "../slices/authSlice" 
import { privateApi } from "../services/private" 
import { addToast } from "../slices/toastSlice"
import { v4 as uuidv4 } from "uuid" 
import { AsyncSelect } from "./AsyncSelect"
import { GroupBase, SelectInstance } from "react-select"
import { USER_PROFILE_ORG_URL } from "../helpers/urls"
import { PaginationRow } from "./page-elements/PaginationRow"
import { TicketRow } from "./TicketRow" 
import { TICKETS } from "../helpers/routes"
import { Banner } from "./page-elements/Banner"
import { TicketsContainer } from "./tickets/TicketsContainer"

export const Dashboard = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [switchOrgId, setSwitchOrgId] = useState<number | null>(null)
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [switchUserOrganization, {isLoading, error}] = useSwitchUserOrganizationMutation()
	const [assignedSearchParams, setAssignedSearchParams] = useState<Record<string, any>>({
		sortBy: "createdAt", 
		order: "desc", 
		page: "1", 
		includeAssignees: true, 
		assignedToUser: userProfile?.id,
		perPage: 5,
	})
	const [watchSearchParams, setWatchSearchParams] = useState<Record<string, any>>({
		sortBy: "createdAt", 
		order: "desc", 
		page: "1", 
		includeAssignees: true, 
		assignedToUser: userProfile?.id, 
		isWatching: true,
		perPage: 5	
	})
	const {data: assignedTickets, isLoading: isAssignedTicketsLoading} = useGetTicketsQuery(assignedSearchParams) 
	const {data: watchedTickets, isLoading: isWatchedTicketsLoading} = useGetTicketsQuery(watchSearchParams) 
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 

	const switchOrganization = async () => {
		if (switchOrgId){
			try {
				const data = await switchUserOrganization({organizationId: switchOrgId}).unwrap()
				dispatch(setCredentials(data))
				dispatch(privateApi.util.resetApiState())
	    		navigate("/", {state: {type: "success", alert: "You have switched organizations!"}, replace: true})
			}
			catch (e){
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to switch organization.",
	    		}))
			}
		}
		selectRef?.current?.clearValue()
		setCacheKey(uuidv4())
	}

	const setWatchFilter = (filterById: number | undefined) => {
		setWatchSearchParams({
			...watchSearchParams,
			ticketType: filterById
		})
	}

	const setAssignedFilter = (filterById: number | undefined) => {
		setAssignedSearchParams({
			...assignedSearchParams,
			ticketType: filterById
		})
	}

	const setWatchingPage = (page: number) => {
		setWatchSearchParams({
			...watchSearchParams,
			page: page.toString()
		})
	}

	const setAssignedToPage = (page: number) => {
		setAssignedSearchParams({
			...assignedSearchParams,
			page: page.toString()
		})
	}
 
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4 tw-justify-center tw-items-center">
			{location?.state?.alert ? <Banner message = {location.state.alert} type = {location.state.type}/> : null}
			<div className = "tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm">
				<h1>Dashboard</h1>	
			</div>
			{/*<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<p className = "tw-font-bold">Organizations</p>
				<div>
					<AsyncSelect 
						ref={selectRef}
						cacheKey={cacheKey} 
						urlParams={{excludeOwn: true}} 
						onSelect={(selectedOption: OptionType | null) => {
							if (selectedOption){
								setSwitchOrgId(Number(selectedOption.value))
							}
						}} 
						endpoint={USER_PROFILE_ORG_URL} 
						className = "tw-w-full"
					/>
				</div>
				<button onClick={switchOrganization} className = "button">Switch Organization</button>
			</div>*/}
			<div className = "tw-p-4 tw-w-full tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-space-between lg:tw-gap-x-4">
				<div className = "tw-flex-1 tw-flex tw-justify-center tw-items-center">Boards</div>
				<div className = "tw-flex-1 tw-flex tw-justify-center tw-items-center">Progress</div>
				<div className = "tw-flex-1 tw-flex tw-justify-center tw-items-center">Time Spent</div>
			</div>
			<div className = "tw-w-full tw-flex tw-flex-col lg:tw-flex lg:tw-flex-row tw-h-full lg:tw-gap-x-4">
				{assignedTickets && !isAssignedTicketsLoading ? (
					<TicketsContainer setPage={setAssignedToPage} setFilterBy={setAssignedFilter} tickets={assignedTickets} title={"Assigned"}/>
				) : null}
				{watchedTickets && !isWatchedTicketsLoading ? (
					<TicketsContainer setPage={setWatchingPage} setFilterBy={setWatchFilter} tickets={watchedTickets} title={"Watching"}/>
				) : null}
			</div>
		</div>
	)	
}