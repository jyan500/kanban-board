import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" 
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useGetBoardStatusesQuery } from "../../services/private/board"
import { Board as KanbanBoard } from "../../components/Board" 
import { KanbanBoard as KanbanBoardType } from "../../types/common" 
import { setBoard, setBoardInfo, setStatusesToDisplay, setFilteredTickets, setTickets as setBoardTickets } from "../../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ArrowButton } from "../../components/page-elements/ArrowButton"
import { LoadingSpinner } from "../../components/LoadingSpinner"

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const navigate = useNavigate()
	const boardId = params.boardId ? parseInt(params.boardId) : undefined 
	const dispatch = useAppDispatch()
	const {data: boardData, isLoading: isGetBoardLoading } = useGetBoardQuery(boardId ? {id: boardId, urlParams: {assignees: true}} : skipToken)
	const {data: boardTicketData, isLoading: isGetBoardTicketsLoading } = useGetBoardTicketsQuery(boardId ? {id: boardId, urlParams: {"includeRelationshipInfo": true}} : skipToken)
	const {data: statusData, isLoading: isGetBoardStatusesLoading } = useGetBoardStatusesQuery(boardId ?? skipToken)
	const board = useAppSelector((state) => state.board)

	useEffect(() => {
		if (boardData?.length){
			let board: KanbanBoardType = {}
			let ids: Array<number> = [];
			if (statusData?.length){
				for (let i = 0; i < statusData.length; ++i){
					// find the tickets that belong to the board
					board[statusData[i].id] = boardTicketData?.length ? boardTicketData.filter((ticket) => ticket.statusId === statusData[i].id).map((ticket) => ticket.id) : [] 
				}
			}
			dispatch(setBoard(board))
			dispatch(setBoardInfo(boardData[0]))
			dispatch(setBoardTickets(boardTicketData ?? []))
			dispatch(setFilteredTickets(boardTicketData ?? []))
			dispatch(setStatusesToDisplay(statusData ?? []))
		}
	}, [boardData, statusData, boardTicketData])

	return (
		<div className = "tw-space-y-2">
			<ArrowButton text="Back" onClick={() => navigate(-1)}/>
			{ !isGetBoardLoading && !isGetBoardTicketsLoading && !isGetBoardStatusesLoading ? 
				<>
					<h1>{boardData?.find((data) => data.id === boardId)?.name}</h1>
					<KanbanBoard
					/> 
				</>
				: <LoadingSpinner className = "!tw-w-8 !tw-h-8"/>
			}
		</div>
	)
}