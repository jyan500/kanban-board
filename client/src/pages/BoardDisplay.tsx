import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useGetBoardsQuery } from "../services/private/board" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { setTicket } from "../slices/ticketSlice"
import { useGetTicketsQuery } from "../services/private/ticket"
import { Table } from "../components/Table" 
import { useBoardConfig, BoardConfigType } from "../helpers/table-config/useBoardConfig" 
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"

export const BoardDisplay = () => {
	const { boardId } = useParams();
	const { userRoles } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const {data: boardData } = useGetBoardsQuery({lastModified: true, numTickets: true, assignees: true})
	const {data: ticketData } = useGetTicketsQuery()
	const config: BoardConfigType = useBoardConfig()
	const dispatch = useAppDispatch()
	const adminUserRole = userRoles.find((role) => role.name === "ADMIN")
	const boardAdminUserRole = userRoles.find((role) => role.name === "BOARD_ADMIN")

	useEffect(() => {
		if (ticketData?.length){
			dispatch(setTicket({tickets: ticketData}))
		}
	}, [ticketData])

	return (
		<div>
			<div>
				<h1>{boardId ? boardData?.find((board) => board.id === parseInt(boardId))?.name : "Boards"}</h1>
				{userProfile?.userRoleId === adminUserRole?.id || userProfile?.userRoleId === boardAdminUserRole?.id ? (
					<button>Add New Board</button>
				) : null}
			</div>
			{
				boardId != null ? (
					<div className = "link-container">
						<ArrowBackward className = "icon"/>
						<Link to = {`/boards`}>Return to Boards</Link>
					</div>
				) : (
					<Table data={boardData} config={config}/>
				)
			}
			<Outlet/>
		</div>
	)
}