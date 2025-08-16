import React, { useEffect } from "react"
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom" 
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useGetBoardStatusesQuery } from "../../services/private/board"
import { Board as KanbanBoard } from "../../components/Board" 
import { KanbanBoard as KanbanBoardType } from "../../types/common" 
import { setBoard, setBoardInfo, setStatusesToDisplay, setFilteredTickets, setGroupBy, setTickets as setBoardTickets } from "../../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ArrowButton } from "../../components/page-elements/ArrowButton"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { Link } from "react-router-dom"
import { SCHEDULE, TABLE, BOARDS, TICKETS } from "../../helpers/routes"
import { Banner } from "../../components/page-elements/Banner"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { SearchBarPlaceholder } from "../../components/placeholders/SearchBarPlaceholder"
import { BoardPlaceholder } from "../../components/placeholders/BoardPlaceholder"
import { FilterButton } from "../../components/page-elements/FilterButton"

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const navigate = useNavigate()
	const boardId = params.boardId ? parseInt(params.boardId) : undefined 
	const dispatch = useAppDispatch()
	const {data: boardData, isLoading: isGetBoardLoading, isError: isGetBoardError } = useGetBoardQuery(boardId ? {id: boardId, urlParams: {assignees: true}} : skipToken)
	const {data: boardTicketData, isLoading: isGetBoardTicketsLoading , isError: isGetBoardTicketsError } = useGetBoardTicketsQuery(boardId ? {id: boardId, urlParams: {"skipPaginate": true, "includeAssignees": true, "includeRelationshipInfo": true, "limit": true}} : skipToken)
	const {data: statusData, isLoading: isGetBoardStatusesLoading, isError: isGetBoardStatusesError } = useGetBoardStatusesQuery(boardId ? {id: boardId, isActive: true} : skipToken)
	const { pathname } = useLocation()
	const board = useAppSelector((state) => state.board)

	// only reset the "group by" on the toolbar if we're navigating to this page
	useEffect(() => {
		dispatch(setGroupBy("NONE"))
	}, [boardId])

	useEffect(() => {
		if (boardData?.length){
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
			dispatch(setBoardTickets(boardTicketData?.data ?? []))
			dispatch(setFilteredTickets(boardTicketData?.data ?? []))
			dispatch(setStatusesToDisplay(statusData ?? []))
		}
	}, [boardData, statusData, boardTicketData])

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
	]


	return (
		<div className = "tw-space-y-2">
			<ArrowButton text="Back" onClick={() => navigate(-1)}/>
			{(isGetBoardError || isGetBoardTicketsError || isGetBoardStatusesError) ? 
				(
					<Banner message = {"Something went wrong!"} type = "failure"/>
				) : null
			}
			{ !isGetBoardLoading && !isGetBoardTicketsLoading && !isGetBoardStatusesLoading ? 
				<>
					<h1>{boardData?.find((data) => data.id === boardId)?.name}</h1>
					<div className = "tw-p-1 lg:tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-200">
						{
							defaultLinks.map((link: {pathname: string, text: string}) => {
							 	return (
							 		<FilterButton key={`filter_button_${link.text}`} isActive={link.pathname === pathname} onClick={(e) => {
							 			navigate(link.pathname)
							 		}}>
							 			{link.text}
							 		</FilterButton>
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