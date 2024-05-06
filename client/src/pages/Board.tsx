import React from "react"
import { useParams } from "react-router-dom" 
import { useGetBoardQuery } from "../services/board"

export const Board = () => {
	const params = useParams<{boardId: string}>()
	const {data} = useGetBoardQuery(params.boardId ?? "")
	return (
		<div>
			<p>Board: {data?.[0].name}</p>
		</div>
	)
}