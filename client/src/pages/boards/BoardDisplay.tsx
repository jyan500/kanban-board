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

	const dispatch = useAppDispatch()

	return (
		<div>
			<Outlet/>
		</div>
	)
}