import React from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { Board as KanbanBoard } from "../components/Board" 
import { logout } from "../slices/authSlice" 

export const Home = () => {
	const dispatch = useAppDispatch()
	const { token } = useAppSelector((state) => state.auth)
	const onLogout = () => {
		dispatch(logout())
	}
	return (
		<div>
			<h1>Home</h1>
			<button onClick={onLogout}>Logout</button>
		</div>
	)
}