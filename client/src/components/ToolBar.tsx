import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SearchBar } from "./SearchBar" 
import "../styles/toolbar.css"
import { setBoard, setFilteredTickets } from "../slices/boardSlice" 
import { toggleShowModal, setModalType } from "../slices/modalSlice" 
import { prioritySort as sortByPriority } from "../helpers/functions"
import { useDebouncedValue } from "../hooks/useDebouncedValue" 
import { OverlappingRow } from "./OverlappingRow" 

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	const { boardInfo: allBoards } = useAppSelector((state) => state.boardInfo)
	const { board, boardInfo: primaryBoardInfo, tickets } = useAppSelector((state) => state.board)
	const { priorities } = useAppSelector((state) => state.priority)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const isAdminOrUserRole = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	const [value, setValue] = useState("")
	const debouncedSearchTerm = useDebouncedValue(value, 300)
	const boardInfo = allBoards.find((board) => board.id === primaryBoardInfo?.id)

	useEffect(() => {
		if (value === ""){
			dispatch(setFilteredTickets(tickets))
		}
		else {
			const filtered = tickets.filter((obj) => obj.name.toLowerCase().includes(value.toLowerCase()))
			dispatch(setFilteredTickets(filtered))
		}	
	}, [debouncedSearchTerm])

	const prioritySort = (sortOrder: 1 | -1) => {
		let sortedBoard = sortByPriority(
			board, tickets, priorities, sortOrder, undefined
		)
		dispatch(setBoard(sortedBoard))
	}

	const onSearchBarChange = (v: string) => {
		setValue(v)	
	}

	return (
		<div className = "toolbar">
			<SearchBar placeholder={"Ticket Name"} onChange={onSearchBarChange}/>
			<div className = "assignees-row">
				{boardInfo?.assignees && boardInfo?.assignees?.length > 0 ? 
					<OverlappingRow total={boardInfo?.assignees?.length}/>
					: null
				}
			</div>
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