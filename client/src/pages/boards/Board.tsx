import React, { useEffect } from "react"
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom" 
import { useGetUserBoardFiltersQuery } from "../../services/private/userProfile"
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useLazyGetBoardTicketsQuery,
	useGetBoardFiltersQuery,
	useGetBoardStatusesQuery } from "../../services/private/board"
import { Board as KanbanBoard } from "../../components/Board" 
import { GenericObject, KanbanBoard as KanbanBoardType } from "../../types/common" 
import { setBoard, setBoardInfo, setStatusesToDisplay, setFilteredTickets, setGroupBy, setTickets as setBoardTickets } from "../../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ArrowButton } from "../../components/page-elements/ArrowButton"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import { SCHEDULE, TABLE, BACKLOG, BOARDS, TICKETS, SPRINTS } from "../../helpers/routes"
import { Banner } from "../../components/page-elements/Banner"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { SearchBarPlaceholder } from "../../components/placeholders/SearchBarPlaceholder"
import { BoardPlaceholder } from "../../components/placeholders/BoardPlaceholder"
import { TabButton } from "../../components/page-elements/TabButton"
import { setFilters, setFilterIdMap, setFilterButtonState, BoardFilters } from "../../slices/boardFilterSlice"

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const navigate = useNavigate()
	const boardId = params.boardId ? parseInt(params.boardId) : undefined 
	const dispatch = useAppDispatch()
	const { filters, filterIdMap } = useAppSelector((state) => state.boardFilter)
	const { tickets } = useAppSelector((state) => state.board)
	const {data: boardFilterData, isLoading: isBoardFilterDataLoading} = useGetBoardFiltersQuery(boardId ? {boardId} : skipToken)
	const {data: userBoardFilterData, isLoading: isUserBoardFilterDataLoading } = useGetUserBoardFiltersQuery()
	const {data: boardData, isLoading: isGetBoardLoading, isError: isGetBoardError } = useGetBoardQuery(boardId ? {id: boardId, urlParams: {assignees: true}} : skipToken)
	const [trigger, {data: boardTicketData, isLoading: isGetBoardTicketsLoading , isError: isGetBoardTicketsError }] = useLazyGetBoardTicketsQuery()
	const {data: statusData, isLoading: isGetBoardStatusesLoading, isError: isGetBoardStatusesError } = useGetBoardStatusesQuery(boardId ? {id: boardId, isActive: true} : skipToken)
	const { pathname } = useLocation()
	const board = useAppSelector((state) => state.board)

	const getBoardFilterAttribute = (arrayData: Array<GenericObject>, name: string, attribute: string) => {
		if (arrayData.length){
			return arrayData.find((obj) => obj.name === name)?.[attribute] ?? 0
		}
		return 0
	}

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
		}
		if (userBoardFilterData){
			const sprintId = getBoardFilterAttribute(userBoardFilterData, "sprintId", "value")
			const assigneeId = getBoardFilterAttribute(userBoardFilterData, "assignee", "value")
			const ticketTypeId = getBoardFilterAttribute(userBoardFilterData, "ticketTypeId", "value")
			const statusId = getBoardFilterAttribute(userBoardFilterData, "statusId", "value")
			const priorityId = getBoardFilterAttribute(userBoardFilterData, "priorityId", "value")
			newFilters = {
				...filters,
				...(sprintId !== 0 ? { sprintId: sprintId } : {}),
				...(assigneeId !== 0 ? { assignee: assigneeId } : {}),
				...(ticketTypeId !== 0 ? { ticketTypeId: ticketTypeId } : {}),
				...(statusId !== 0 ? { statusId: statusId } : {}),	
				...(priorityId !== 0 ? { priorityId: priorityId } : {}),	
			}
			// if there are any filters applied, set filter button state to 1 to show that filters have been applied
			const filtersApplied = !(ticketTypeId === 0 && priorityId === 0 && statusId === 0 && assigneeId === 0 && sprintId === 0)
			dispatch(setFilterButtonState(filtersApplied))
			dispatch(setFilters(newFilters))
		}

	}, [boardFilterData, userBoardFilterData])

	/* When filters are changed, manually re-trigger the fetch to retrieve new ticket ids */
	useEffect(() => {
		if (boardId){
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
					"skipPaginate": true, 
					"includeAssignees": true, 
					"includeRelationshipInfo": true, 
					"limit": true
				}
			})
		}
	}, [filters])

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

	const defaultLinks = [
		{
			pathname: `${boardPath}`, text: "Board",
		},
		{
			pathname: `${boardPath}/${SCHEDULE}`, text: "Schedule",
		},
		{
			pathname: `${boardPath}/${TABLE}`, text: "Table",
		},
		{
			pathname: `${boardPath}/${BACKLOG}`, text: "Backlog"
		},
		{
			pathname: `${boardPath}/${SPRINTS}`, text: "Past Sprints",
		}
	]


	return (
		<div className = "tw-space-y-2">
			<ArrowButton text="Back" onClick={() => navigate(-1)}/>
			{(isGetBoardError || isGetBoardTicketsError || isGetBoardStatusesError) ? 
				(
					<Banner message = {"Something went wrong!"} type = "failure"/>
				) : null
			}
			{ !isBoardFilterDataLoading && !isUserBoardFilterDataLoading && !isGetBoardLoading && !isGetBoardTicketsLoading && !isGetBoardStatusesLoading ? 
				<>
					<h1>{boardData?.find((data) => data.id === boardId)?.name}</h1>
					<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-200">
						{
							defaultLinks.map((link: {pathname: string, text: string}) => {
							 	return (
							 		<TabButton key={`filter_button_${link.text}`} isActive={link.pathname === pathname} onClick={(e) => {
							 			navigate(link.pathname)
							 		}}>
							 			{link.text}
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
					<div className = "tw-w-32 tw-h-6 tw-bg-gray-200"></div>
					<SearchBarPlaceholder/>	
					<BoardPlaceholder/>
				</LoadingSkeleton>
			}
		</div>
	)
}