import React from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SearchBar } from "./SearchBar" 
import "../styles/toolbar.css"
import { setBoard } from "../slices/boardSlice" 
import { toggleShowModal, setModalType } from "../slices/modalSlice" 
import { prioritySort as sortByPriority } from "../helpers/functions"

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	const { board } = useAppSelector((state) => state.board)
	const { tickets } = useAppSelector((state) => state.ticket)
	const { priorities } = useAppSelector((state) => state.priority)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const isAdminOrUserRole = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")

	const prioritySort = (sortOrder: 1 | -1) => {
		let sortedBoard = sortByPriority(
			board, tickets, priorities, sortOrder, undefined
		)
		dispatch(setBoard(sortedBoard))
	}
	return (
		<div className = "toolbar">
			<SearchBar/>
			<div className = "btn-group">
				<button onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("TICKET_FORM"))
				}}>Add Ticket</button>
				{
					isAdminOrUserRole ? (
					<button onClick = {() => {
						dispatch(toggleShowModal(true))
						dispatch(setModalType("STATUS_FORM"))
					}}>Edit Statuses</button>) : null
				}
				<button className = "" onClick = {(e) => prioritySort(1)}>Sort By Priority</button>
			</div>
		</div>
	)
}