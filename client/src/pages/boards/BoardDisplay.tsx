import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { useGetBoardsQuery } from "../../services/private/board" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { setBoardInfo }  from "../../slices/boardInfoSlice"
import { Table } from "../../components/Table" 
import { useBoardConfig, BoardConfigType } from "../../helpers/table-config/useBoardConfig" 

export const BoardDisplay = () => {
	const { boardId } = useParams();
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)

	const {data: boardData } = useGetBoardsQuery({lastModified: true, numTickets: true, assignees: true})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (boardData?.length){
			dispatch(setBoardInfo({boardInfo: boardData}))
		}
	}, [boardData])

	return (
		<div>
			<Outlet/>
		</div>
	)
}