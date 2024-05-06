import React from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { useGetBoardsQuery } from "../services/board" 
import { Link, Outlet } from "react-router-dom" 

export const BoardDisplay = () => {
	const {data} = useGetBoardsQuery()
	return (
		<div>
			<h1>Boards</h1>
			<div>
				{data?.map((board) => <Link key={board.id} to={`/boards/${board.id}`}>{board.name}</Link>)}
			</div>
			<Outlet/>
		</div>
	)
}