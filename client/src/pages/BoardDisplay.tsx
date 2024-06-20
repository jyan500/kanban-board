import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useGetBoardsQuery } from "../services/private/board" 
import { Link, Outlet } from "react-router-dom" 
import { setTicket } from "../slices/ticketSlice"
import { useGetTicketsQuery } from "../services/private/ticket"
import { Table } from "../components/Table" 

export const BoardDisplay = () => {
	const {data: boardData } = useGetBoardsQuery({lastModified: true})
	const {data: ticketData } = useGetTicketsQuery()
	const dispatch = useAppDispatch()
	const headers = ["Name", "Tickets", "Assignees", "Last Modified"]

	useEffect(() => {
		if (ticketData?.length){
			dispatch(setTicket({tickets: ticketData}))
		}
	}, [ticketData])

	return (
		<div>
			<h1>Boards</h1>
			<div>
				{boardData?.map((board) => <Link key={board.id} to={`/boards/${board.id}`}>{board.name}</Link>)}
			</div>
			{/*<Table 
				data = {} 
				headers = {} 
			/>*/}
			<Outlet/>
		</div>
	)
}