import React, {useState, useRef, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import "../styles/dashboard.css"
import { useNavigate, useLocation, Link } from "react-router-dom" 
import { useGetUserOrganizationsQuery, useSwitchUserOrganizationMutation } from "../services/private/userProfile"
import { useGetTicketsQuery } from "../services/private/ticket"
import { Ticket, Organization, Toast, OptionType, ProgressBarPercentage } from "../types/common"
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
import { ProgressBar } from "./page-elements/ProgressBar"
import { TICKETS, BOARDS } from "../helpers/routes"
import { Banner } from "./page-elements/Banner"
import { TicketsContainer } from "./tickets/TicketsContainer"
import { useGetBoardsQuery } from "../services/private/board"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { MdOutlineViewKanban as BoardIcon } from "react-icons/md";
import { LuClock as ClockIcon } from "react-icons/lu";
import { BsFillFileBarGraphFill as BarsIcon } from "react-icons/bs";
import { IconContext } from "react-icons"
import { FaRegBuilding } from "react-icons/fa";
import { convertMinutesToTimeDisplay } from "../helpers/functions"

type DashboardSectionProps = {
	title: string
	iconColor?: string
	iconClassname?: string
	icon: React.ReactNode
	children: React.ReactNode
}

const DashboardSection = ({title, iconColor, iconClassname, icon, children}: DashboardSectionProps) => {
	return (
		<div className = "tw-flex-1 tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
				<IconContext.Provider value={{color: iconColor ?? "var(--bs-primary)", className: `${iconClassname ?? "tw-w-4 tw-h-4"}`}}>
					{/* icon */}	
					{icon}
				</IconContext.Provider>
				<h3>{title}</h3>
			</div>
			{children}
		</div>
	)
}

export const Dashboard = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [switchOrgId, setSwitchOrgId] = useState<number | null>(null)
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [switchUserOrganization, {isLoading, error}] = useSwitchUserOrganizationMutation()
	const [assignedSearchParams, setAssignedSearchParams] = useState<Record<string, any>>({})
	const [watchSearchParams, setWatchSearchParams] = useState<Record<string, any>>({})
	const {data: assignedTickets, isLoading: isAssignedTicketsLoading} = useGetTicketsQuery(Object.keys(assignedSearchParams).length > 0 ? assignedSearchParams : skipToken)
	const {data: watchedTickets, isLoading: isWatchedTicketsLoading} = useGetTicketsQuery(Object.keys(watchSearchParams).length > 0 ? watchSearchParams : skipToken)
	const {data: boards, isLoading: isBoardsLoading} = useGetBoardsQuery({includeUserDashboardInfo: true, perPage: 5})
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 

	// extract the remaining dashboard info into separate array of objects for
	// easier display on the dashboard
	const timeSpentPerBoard = boards?.data?.map((board) => {
		return {
			id: board.id,
			minutesSpent: board.minutesSpent ? convertMinutesToTimeDisplay(board.minutesSpent, false, true) : ""
		}	
	})
	const percentageCompletePerBoard = boards?.data?.map((board) => {
		return {
			id: board.id,
			percentComplete: [
				{className: "tw-bg-primary", label: "Completed", value: board.percentComplete ?? 0},
				{className: "tw-bg-secondary", label: "Not Completed", value: 100 - (board.percentComplete ?? 0)},
			]	
		}	
	})

	useEffect(() => {
		if (userProfile){
			const params = {
				sortBy: "createdAt", 
				order: "desc", 
				page: "1", 
				includeAssignees: true, 
				assignedToUser: userProfile?.id,
				perPage: 5,
			}
			setAssignedSearchParams(params)
			setWatchSearchParams({...params, isWatching: true})
		}
	}, [userProfile])

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
			<div className = "tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-md">
				<h2>Dashboard</h2>
				<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-space-between lg:tw-gap-x-4">
					<DashboardSection title={"Organization"} icon={<FaRegBuilding/>}>
						<>
							<p>{userProfile?.organizationName}</p>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
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
								<button onClick={switchOrganization} className = "button">Switch Organization</button>
							</div>
						</>
					</DashboardSection>
					<DashboardSection iconColor={"var(--bs-primary)"} icon={<BoardIcon/>} title={"Boards"}>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{boards?.data?.map((board) => (
								<div>
									<Link to={`${BOARDS}/${board.id}`}>{board.name}</Link>
								</div>
							))}	
							<div>
								<Link to={`${BOARDS}`}>See More</Link>
							</div>
						</div>	
					</DashboardSection>
					<DashboardSection iconColor={"var(--bs-warning)"} icon={<BarsIcon/>} title={"Progress"}>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{
								percentageCompletePerBoard?.map((board) => (
									<div className = "tw-flex tw-flex-row tw-items-center tw-min-h-[24px]">
										<ProgressBar percentages = {board.percentComplete}/> 
									</div>
								))
							}	
						</div>
					</DashboardSection>
					<DashboardSection iconColor={"var(--bs-success)"} icon={<ClockIcon/>} title={"Time Spent"}>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{
								timeSpentPerBoard?.map((board) => (
									<div>{board.minutesSpent}</div>
								))
							}
						</div>
					</DashboardSection>
				</div>
			</div>
			<div className = "tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-md">
				<h2>My Tasks</h2>
				<div className = "tw-w-full tw-flex tw-flex-col lg:tw-flex lg:tw-flex-row tw-h-full lg:tw-gap-x-4">
					{assignedTickets && !isAssignedTicketsLoading ? (
						<TicketsContainer setPage={setAssignedToPage} setFilterBy={setAssignedFilter} tickets={assignedTickets} title={"Assigned"}/>
					) : null}
					{watchedTickets && !isWatchedTicketsLoading ? (
						<TicketsContainer setPage={setWatchingPage} setFilterBy={setWatchFilter} tickets={watchedTickets} title={"Watching"}/>
					) : null}
				</div>
			</div>
		</div>
	)	
}