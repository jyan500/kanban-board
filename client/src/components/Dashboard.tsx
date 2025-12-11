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
import { IconBars } from "./icons/IconBars"
import { IconClock } from "./icons/IconClock"
import { IconBuilding } from "./icons/IconBuilding"
import { IconBoard } from "./icons/IconBoard"
import { IconContext } from "react-icons"
import { convertMinutesToTimeDisplay } from "../helpers/functions"
import { SwitchOrganizationForm } from "./forms/SwitchOrganizationForm"
import { LoadingSkeleton } from "./page-elements/LoadingSkeleton"
import { RowContentLoading } from "./page-elements/RowContentLoading"
import { RowPlaceholder } from "./placeholders/RowPlaceholder"

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
				{icon}
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
	const [assignedSearchParams, setAssignedSearchParams] = useState<Record<string, any>>({})
	const [watchSearchParams, setWatchSearchParams] = useState<Record<string, any>>({})
	const { statuses } = useAppSelector((state) => state.status)
	const nonCompletedStatusIds = statuses.filter((status) => !status.isCompleted).map((status) => status.id)
	const {data: assignedTickets, isLoading: isAssignedTicketsLoading} = useGetTicketsQuery(Object.keys(assignedSearchParams).length > 0 ? assignedSearchParams : skipToken)
	const {data: watchedTickets, isLoading: isWatchedTicketsLoading} = useGetTicketsQuery(Object.keys(watchSearchParams).length > 0 ? watchSearchParams : skipToken)
	const {data: boards, isLoading: isBoardsLoading} = useGetBoardsQuery({includeUserDashboardInfo: true, perPage: 5})

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
				statusIds: nonCompletedStatusIds,
				assignedToUser: userProfile?.id,
				perPage: 5,
			}
			setAssignedSearchParams(params)
			setWatchSearchParams({...params, isWatching: true})
		}
	}, [userProfile])

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
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			{location?.state?.alert ? <Banner message = {location.state.alert} type = {location.state.type}/> : null}
			<div className = "tw-p-2 lg:tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-md">
				<h2>Dashboard</h2>
				<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-space-between lg:tw-gap-x-4">
					{
						userProfile?.isActive ? (
							<DashboardSection title={"Organization"} icon={<IconBuilding/>}>
								<SwitchOrganizationForm/>	
							</DashboardSection>
						) : 
						<RowContentLoading/>
					}
					<DashboardSection iconColor={"var(--bs-primary)"} icon={<IconBoard color = {"var(--bs-primary)"}/>} title={"Boards"}>
						{
							!isBoardsLoading ? (
								<div className = "tw-flex tw-flex-col tw-gap-y-2">
									{boards?.data?.map((board) => (
										<div key={`active-boards-${board.id}`}>
											<Link to={`${BOARDS}/${board.id}`}><span className = "tw-font-medium">{board.name}</span></Link>
										</div>
									))}	
									<div>
										<Link to={`${BOARDS}`}>See More</Link>
									</div>
								</div>	
							) : (
								<RowContentLoading/>
							)
						}
						
					</DashboardSection>
					<DashboardSection iconColor={"var(--bs-warning)"} icon={<IconBars color={"var(--bs-warning)"}/>} title={"Progress"}>
						{
							!isBoardsLoading ? (
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								{
									percentageCompletePerBoard?.map((board) => (
										<div key={`progress-bar-${board.id}`} className = "tw-flex tw-flex-row tw-items-center tw-min-h-[24px]">
											<ProgressBar percentages = {board.percentComplete}/> 
										</div>
									))
								}	
							</div>
							) : (
								<RowContentLoading/>
							)
						}
					</DashboardSection>
					<DashboardSection iconColor={"var(--bs-success)"} icon={<IconClock color={"var(--bs-success)"}/>} title={"Time Spent"}>
						{
							!isBoardsLoading ? (
								<div className = "tw-flex tw-flex-col tw-gap-y-2">
									{
										timeSpentPerBoard?.map((board) => (
											<div key={`time-spent-per-board-${board.id}`}><span className = "tw-font-medium">{board.minutesSpent}</span></div>
										))
									}
								</div>
							) : (
								<RowContentLoading/>
							)
						}
					</DashboardSection>
				</div>
			</div>
			<div className = "tw-p-2 lg:tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-md">
				<h2>My Tasks</h2>
				<div className = "tw-w-full tw-flex tw-flex-col lg:tw-flex lg:tw-flex-row tw-h-full lg:tw-gap-x-4">
					{assignedTickets && !isAssignedTicketsLoading ? (
						<TicketsContainer setPage={setAssignedToPage} setFilterBy={setAssignedFilter} tickets={assignedTickets} title={"Assigned"}/>
					) : 
						<LoadingSkeleton height="tw-h-[800px]" width="tw-w-full">
							<RowPlaceholder/>	
						</LoadingSkeleton>
					}
					{watchedTickets && !isWatchedTicketsLoading ? (
						<TicketsContainer setPage={setWatchingPage} setFilterBy={setWatchFilter} tickets={watchedTickets} title={"Watching"}/>
					) : 
						<LoadingSkeleton height="tw-h-[800px]" width="tw-w-full">
							<RowPlaceholder/>	
						</LoadingSkeleton>
					}
				</div>
			</div>
		</div>
	)	
}