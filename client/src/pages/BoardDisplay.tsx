import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useGetBoardsQuery } from "../services/private/board" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { setTicket } from "../slices/ticketSlice"
import { useGetTicketsQuery } from "../services/private/ticket"
import { Table } from "../components/Table" 
import { useBoardConfig, BoardConfigType } from "../helpers/table-config/useBoardConfig" 

export const BoardDisplay = () => {
	const { boardId } = useParams();
	const {data: boardData } = useGetBoardsQuery({lastModified: true, numTickets: true, assignees: true})
	const {data: ticketData } = useGetTicketsQuery()
	const config: BoardConfigType = useBoardConfig()
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (ticketData?.length){
			dispatch(setTicket({tickets: ticketData}))
		}
	}, [ticketData])

	return (
		<div>
			<h1>Boards</h1>
			{
				boardId != null ? (
					<Link to = {`/boards`}>Return to Boards</Link>
				) : (
					<Table data={boardData} config={config}/>
				)
			}
			<Outlet/>
		</div>
	)
}