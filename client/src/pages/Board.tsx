import React from "react"
import { useParams } from "react-router-dom" 
import { useGetBoardQuery, useGetBoardTicketsQuery } from "../services/private/board"

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const {data: boardData} = useGetBoardQuery(params.boardId ?? "")
	const {data: ticketData} = useGetBoardTicketsQuery(params.boardId ?? "")
	return (
		<div>
			<p>Board: {boardData?.[0].name}</p>
			<ul>
				{ ticketData?.map((ticket) => <li>{ticket.name}</li>) }	
			</ul>
		</div>
	)
}