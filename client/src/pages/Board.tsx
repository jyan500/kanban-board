import React, { useEffect } from "react"
import { useParams } from "react-router-dom" 
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useGetBoardStatusesQuery } from "../services/private/board"
import { Board as KanbanBoard } from "../components/Board" 
import { KanbanBoard as KanbanBoardType } from "../types/common" 
import { setBoard, setBoardInfo, setStatusesToDisplay, setTickets as setBoardTickets } from "../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { skipToken } from '@reduxjs/toolkit/query/react'

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const boardId = params.boardId ? parseInt(params.boardId) : undefined 
	const dispatch = useAppDispatch()
	const {data: boardData} = useGetBoardQuery(boardId ?? skipToken)
	const {data: boardTicketData} = useGetBoardTicketsQuery(boardId ?? skipToken)
	const {data: statusData} = useGetBoardStatusesQuery(boardId ?? skipToken)
	const board = useAppSelector((state) => state.board)
	const { tickets } = useAppSelector((state) => state.ticket)

	useEffect(() => {
		if (boardData?.length){
			let board: KanbanBoardType = {}
			let ids: Array<number> = [];
			if (statusData?.length){
				ids = boardTicketData?.length ? boardTicketData.map((ticket) => ticket.id) : []
				let boardTickets = tickets.filter((t) => ids.includes(t.id))
				for (let i = 0; i < statusData.length; ++i){
					// find the tickets that belong to the board
					board[statusData[i].id] = boardTickets?.length ? boardTickets.filter((ticket) => ticket.statusId === statusData[i].id).map((ticket) => ticket.id) : [] 
				}
			}
			dispatch(setBoard(board))
			dispatch(setBoardInfo(boardData[0]))
			// get only the ids of the tickets and track the ids only
			dispatch(setBoardTickets(ids))
			dispatch(setStatusesToDisplay(statusData ?? []))
		}
	}, [tickets, boardData, statusData, boardTicketData])

	return (
		<div>
			<KanbanBoard
			/>
		</div>
	)
}