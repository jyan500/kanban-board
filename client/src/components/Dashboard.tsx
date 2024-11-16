import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import "../styles/dashboard.css"
import { useNavigate, Link } from "react-router-dom" 
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

export const Dashboard = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [assignedToPage, setAssignedToPage] = useState(1)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [switchOrgId, setSwitchOrgId] = useState<number | null>(null)
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [switchUserOrganization, {isLoading, error}] = useSwitchUserOrganizationMutation()
	const {data: tickets, isFetching: isTicketsFetching} = useGetTicketsQuery({sortBy: "createdAt", order: "desc", page: assignedToPage, assignedToUser: userProfile?.id}) 
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 

	const switchOrganization = async () => {
		if (switchOrgId){
			try {
				const data = await switchUserOrganization({organizationId: switchOrgId}).unwrap()
				dispatch(setCredentials(data))
				dispatch(privateApi.util.resetApiState())
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: "Switched organization successfully!",
	    		}))
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

	return (
		<div className = "tw-flex tw-flex-row tw-justify-between tw-h-full tw-gap-x-4">
			<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-1/3">
				<h1>Organizations</h1>
				<div>
					<AsyncSelect 
						ref={selectRef}
						cacheKey={cacheKey} 
						urlParams={{}} 
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
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-1/3">
				<div className = "tw-flex tw-flex-row tw-justify-between">
					<h1>Assigned To Me</h1>
					<PaginationRow setPage={setAssignedToPage} showPageNums={false} paginationData={tickets?.pagination}/>
				</div>
				<div>
					{tickets?.data?.map((ticket: Ticket) => {
						return (
							<Link key={`assigned_to_${ticket.id}`} to={`${TICKETS}/${ticket.id}`}>
								<TicketRow 
									key={`assigned_to_ticket_${ticket.id}`} 
									ticket={ticket}
								/>
							</Link>
						)
					})}
				</div>
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-1/3">
				<h1>Watched Tickets</h1>
			</div>
		</div>
	)	
}