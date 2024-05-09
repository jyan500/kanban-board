import React, { useEffect } from "react"
import { useParams } from "react-router-dom" 
import { 
	useGetBoardQuery, 
	useGetBoardTicketsQuery, 
	useGetBoardStatusesQuery } from "../services/private/board"
import { Board as KanbanBoard } from "../components/Board" 
import { KanbanBoard as KanbanBoardType } from "../types/common" 
import { setBoard, setStatusesToDisplay, setTickets } from "../slices/boardSlice" 
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const dispatch = useAppDispatch()
	const {data: boardData} = useGetBoardQuery(params.boardId ?? "")
	const {data: ticketData} = useGetBoardTicketsQuery(params.boardId ?? "")
	const {data: statusData} = useGetBoardStatusesQuery(params.boardId ?? "")
	const board = useAppSelector((state) => state.board)

	useEffect(() => {
		if (boardData?.length && statusData?.length && ticketData?.length){
			let board: KanbanBoardType = {}
			for (let i = 0; i < statusData.length; ++i){
				board[statusData[i].id] = ticketData.filter((ticket) => ticket.statusId === statusData[i].id) 
			}
			dispatch(setBoard(board))
			dispatch(setTickets(ticketData))
			dispatch(setStatusesToDisplay(statusData))
		}
	}, [boardData, statusData, ticketData])

	return (
		<div>
			{/*<p>Board: {boardData?.[0].name}</p>
			<ul>
				{ ticketData?.map((ticket) => <li>{ticket.name}</li>) }	
			</ul>

*/}		
			<KanbanBoard
			/>
		</div>
	)
}