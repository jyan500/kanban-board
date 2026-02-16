import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom" 
import { useGetUserBoardFiltersQuery } from "../../services/private/userProfile"
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useLazyGetBoardTicketsQuery,
	useGetBoardFiltersQuery,
	useGetBoardStatusesQuery } from "../../services/private/board"
import { Board as KanbanBoard } from "../../components/Board" 
import { GenericObject, KanbanBoard as KanbanBoardType, UserBoardFilter } from "../../types/common" 
import { setBoard, setBoardInfo, setStatusesToDisplay, setFilteredTickets, setGroupBy, setTickets as setBoardTickets } from "../../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ArrowButton } from "../../components/page-elements/ArrowButton"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import { SCHEDULE, TABLE, BACKLOG, BOARDS, TICKETS, SPRINTS, SUMMARY, CALENDAR } from "../../helpers/routes"
import { Banner } from "../../components/page-elements/Banner"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { SearchBarPlaceholder } from "../../components/placeholders/SearchBarPlaceholder"
import { BoardPlaceholder } from "../../components/placeholders/BoardPlaceholder"
import { TabButton } from "../../components/page-elements/TabButton"
import { setFilters, setFilterIdMap, BoardFilters } from "../../slices/boardFilterSlice"
import { useScreenSize } from "../../hooks/useScreenSize"
import { useClickOutside } from "../../hooks/useClickOutside"
import { SM_BREAKPOINT, LG_BREAKPOINT, PLACEHOLDER_COLOR } from "../../helpers/constants"
import { BoardNavDropdown } from "../../components/dropdowns/BoardNavDropdown"
import { IconArrowDown } from "../../components/icons/IconArrowDown"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { IconBoard } from "../../components/icons/IconBoard"
import { IconCalendar } from "../../components/icons/IconCalendar"
import { IconTimeline } from "../../components/icons/IconTimeline"
import { IconTable } from "../../components/icons/IconTable"
import { IconBacklog } from "../../components/icons/IconBacklog"
import { IconClock } from "../../components/icons/IconClock"
import { IconBars } from "../../components/icons/IconBars"
import { useTrackRecentlyViewed } from "../../hooks/useTrackRecentlyViewed"
import { STANDARD_BORDER_COLOR, PRIMARY_TEXT } from "../../helpers/constants" 

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const navigate = useNavigate()
	const boardId = params.boardId ? parseInt(params.boardId) : undefined 
	const dispatch = useAppDispatch()
	const [showDropdown, setShowDropdown] = useState(false)
	const { filters, searchTerm, filterIdMap } = useAppSelector((state) => state.boardFilter)
	const { tickets } = useAppSelector((state) => state.board)
	const {data: boardFilterData, isLoading: isBoardFilterDataLoading} = useGetBoardFiltersQuery(boardId ? {boardId} : skipToken)
	const {data: userBoardFilterData, isLoading: isUserBoardFilterDataLoading } = useGetUserBoardFiltersQuery(boardId ? {urlParams: {boardId}} : skipToken)
	const {data: boardData, isLoading: isGetBoardLoading, isError: isGetBoardError } = useGetBoardQuery(boardId ? {id: boardId, urlParams: {assignees: true}} : skipToken)
	const [trigger, {data: boardTicketData, isLoading: isGetBoardTicketsLoading , isError: isGetBoardTicketsError }] = useLazyGetBoardTicketsQuery()
	const {data: statusData, isLoading: isGetBoardStatusesLoading, isError: isGetBoardStatusesError } = useGetBoardStatusesQuery(boardId ? {id: boardId, isActive: true} : skipToken)
	const { pathname } = useLocation()
	const { width, height } = useScreenSize()
	const board = useAppSelector((state) => state.board)
	const dropdownRef = useRef(null)
	const buttonRef = useRef(null)

	const getBoardFilterAttribute = (arrayData: Array<GenericObject>, name: string, attribute: string) => {
		if (arrayData.length){
			return arrayData.find((obj) => obj.name === name)?.[attribute] ?? 0
		}
		return 0
	}

	const getUserBoardFilterAttribute = (userBoardFilterData: Array<UserBoardFilter>, boardFilterId: number, name: string) => {
		return userBoardFilterData.find((data) => data.boardFilterId === boardFilterId && data.name === name)
	}

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(dropdownRef, onClickOutside, buttonRef, showDropdown)

	// only reset the "group by" on the toolbar if we're navigating to this page
	useEffect(() => {
		dispatch(setGroupBy("NONE"))
	}, [boardId])

	useEffect(() => {

		let newFilters: BoardFilters = {
			sprintId: null,
			ticketTypeId: null,
			assignee: null,
			statusId: null,
			priorityId: null,
		}
		if (boardFilterData){
			const sprintFilterId = getBoardFilterAttribute(boardFilterData, "sprintId", "id")
			const assigneeFilterId = getBoardFilterAttribute(boardFilterData, "assignee", "id")
			const ticketTypeFilterId = getBoardFilterAttribute(boardFilterData, "ticketTypeId", "id")
			const statusFilterId = getBoardFilterAttribute(boardFilterData, "statusId", "id")
			const priorityFilterId = getBoardFilterAttribute(boardFilterData, "priorityId", "id")
			dispatch(setFilterIdMap({
				...filterIdMap,
				...(sprintFilterId !== 0 ? { sprintId: sprintFilterId } : {}),
				...(assigneeFilterId !== 0 ? { assigneeId: assigneeFilterId } : {}),
				...(ticketTypeFilterId !== 0 ? { ticketTypeId: ticketTypeFilterId } : {}),
				...(statusFilterId !== 0 ? { statusId: statusFilterId } : {}),	
				...(priorityFilterId !== 0 ? { priorityId: priorityFilterId } : {}),
			}))
			if (userBoardFilterData){
				const sprintId = getUserBoardFilterAttribute(userBoardFilterData, sprintFilterId, "sprintId")
				const assigneeId = getUserBoardFilterAttribute(userBoardFilterData, assigneeFilterId, "assignee")
				const ticketTypeId = getUserBoardFilterAttribute(userBoardFilterData, ticketTypeFilterId, "ticketTypeId")
				const statusId = getUserBoardFilterAttribute(userBoardFilterData, statusFilterId, "statusId")
				const priorityId = getUserBoardFilterAttribute(userBoardFilterData, priorityFilterId, "priorityId")
				newFilters = {
					...filters,
					...(sprintId && sprintId.value !== 0 ? { sprintId: sprintId.value } : { sprintId: null }),
					...(assigneeId && assigneeId.value !== 0 ? { assignee: assigneeId.value } : { assignee: null }),
					...(ticketTypeId && ticketTypeId.value !== 0 ? { ticketTypeId: ticketTypeId.value } : { ticketTypeId: null }),
					...(statusId && statusId.value !== 0 ? { statusId: statusId.value } : { statusId: null }),	
					...(priorityId && priorityId.value !== 0 ? { priorityId: priorityId.value } : { priorityId: null }),	
				}
				dispatch(setFilters(newFilters))
			}
		}
		

	}, [boardFilterData, userBoardFilterData])

	/* 
	When filters or the search term are changed, 
	manually re-trigger the fetch to retrieve new ticket ids 
	*/
	useEffect(() => {
		if (boardId && statusData){
			trigger({
				id: boardId, 
				urlParams: {
					...(Object.keys(filters).reduce((acc: Record<string, any>, key) => {
						const typedKey = key as keyof BoardFilters
						if (filters[typedKey] == null){
							acc[typedKey] = "" 
						}
						else {
							acc[typedKey] = filters[typedKey]
						}
						return acc	
					}, {} as Record<string, any>)),
					...(searchTerm !== "" ? {
						"searchBy": "title",
						"query": searchTerm,
					} : {}),
					"statusIds": statusData.map((status)=>status.id),
					"skipPaginate": true, 
					"includeAssignees": true, 
					"includeIsWatching": true,
					"includeRelationshipInfo": true, 
					"limit": true
				}
			})
		}
	}, [filters, statusData, searchTerm])

	useEffect(() => {
		if (boardData && boardTicketData && !isGetBoardTicketsLoading){
			let board: KanbanBoardType = {}
			let ids: Array<number> = [];
			if (statusData?.length){
				for (let i = 0; i < statusData.length; ++i){
					// find the tickets that belong to the board
					board[statusData[i].id] = boardTicketData?.data?.length ? boardTicketData.data.filter((ticket) => ticket.statusId === statusData[i].id).map((ticket) => ticket.id) : [] 
				}
			}
			dispatch(setBoard(board))
			dispatch(setBoardInfo(boardData[0]))
			dispatch(setStatusesToDisplay(statusData ?? []))
			dispatch(setBoardTickets(boardTicketData?.data ?? []))
			dispatch(setFilteredTickets(boardTicketData?.data ?? []))
		}
	}, [boardData, statusData, isGetBoardTicketsLoading, boardTicketData])

	const boardPath = `${BOARDS}/${boardId}`

	const additionalLinks = [
		{
			pathname: `${boardPath}/${CALENDAR}`, text: "Calendar", icon: <IconCalendar/>,
		},
		{
			pathname: `${boardPath}/${TABLE}`, text: "Table", icon: <IconTable/>,
		},
		{
			pathname: `${boardPath}/${BACKLOG}`, text: "Backlog", icon: <IconBacklog/>,
		},
		{
			pathname: `${boardPath}/${SPRINTS}`, text: "Past Sprints", icon: <IconClock/>,
		}
	]

	const defaultLinks = [
		{
			pathname: `${boardPath}/${SUMMARY}`, text: "Summary", icon: <IconBars/>,	
		},
		{
			pathname: `${boardPath}`, text: "Board", icon: <IconBoard/>,
		},
		{
			pathname: `${boardPath}/${SCHEDULE}`, text: "Schedule", icon: <IconTimeline/>,
		},
		...(width >= SM_BREAKPOINT ? 
			additionalLinks
		: [
			{
				pathname: "", text: "More"
			}
		])
	]

	
	useTrackRecentlyViewed({
		type: "board",
		id: boardId,
		name: boardData?.[0]?.name,
		enabled: !isGetBoardLoading && boardData != null
	})

	return (
		<div className = "tw-space-y-2">
			<ArrowButton text="Back" onClick={() => navigate(`${BOARDS}`)}/>
			{(isGetBoardError || isGetBoardTicketsError || isGetBoardStatusesError) ? 
				(
					<Banner message = {"Something went wrong!"} type = "failure"/>
				) : null
			}
			{ !isBoardFilterDataLoading && !isUserBoardFilterDataLoading && !isGetBoardLoading && !isGetBoardTicketsLoading && !isGetBoardStatusesLoading && boardData && boardTicketData ? 
				<>
					<h1 className={PRIMARY_TEXT}>{boardData?.find((data) => data.id === boardId)?.name}</h1>
					<div className = {`tw-p-1 lg:tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 ${STANDARD_BORDER_COLOR} tw-border-b`}>
						{
							defaultLinks.map((link: {pathname: string, text: string, icon?: React.ReactElement}) => {
								if (link.text === "More"){
									return (
										<div key={`filter_button_more`} className = "tw-relative">
											<TabButton ref={buttonRef} isActive={false} onClick={(e) => {
												setShowDropdown(!showDropdown)
											}}>
												<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
													{showDropdown ? <IconArrowRight/> : <IconArrowDown/>}
													{link.icon}
													{link.text}	
												</div>
											</TabButton>
											{
												showDropdown ? 
													<BoardNavDropdown ref={dropdownRef} additionalLinks={additionalLinks} closeDropdown={() => setShowDropdown(false)}/>
												: null
											}
										</div>
									)
								}
							 	return (
							 		<TabButton key={`filter_button_${link.text}`} isActive={link.pathname === pathname} onClick={(e) => {
							 			navigate(link.pathname)
							 		}}>
										<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
											{link.icon}
											{link.text}
										</div>
							 		</TabButton>
								)
							})
						}
					</div>	
					{boardTicketData?.data?.length === boardData?.[0]?.ticketLimit ? (
						<Banner type = "warning">
							<Link to={`${TICKETS}?board=${boardData?.[0]?.id}`} className = "hover:tw-opacity-60 tw-font-bold">
								This board is displaying the max amount of tickets available. Click here
								to see all tickets.
							</Link>
						</Banner>
					) : null}
					<Outlet/>
				</>
				: 
				<LoadingSkeleton width = "tw-flex tw-flex-col tw-gap-y-4 tw-w-full" height={"tw-h-[1000px]"}>
					<div className = {`tw-w-32 tw-h-6 ${PLACEHOLDER_COLOR}`}></div>
					<SearchBarPlaceholder/>	
					<BoardPlaceholder/>
				</LoadingSkeleton>
			}
		</div>
	)
}