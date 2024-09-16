import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { toggleShowModal, setModalType } from "../../slices/modalSlice" 
import { Table } from "../../components/Table" 
import { useBoardConfig, BoardConfigType } from "../../helpers/table-config/useBoardConfig" 
import { Modal } from "../../components/Modal" 

export const Boards = () => {
	const { boardId } = useParams();
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { boardInfo } = useAppSelector((state) => state.boardInfo)
	const config: BoardConfigType = useBoardConfig()
	const dispatch = useAppDispatch()

	const addNewBoard = () => {
		dispatch(toggleShowModal(true))
		dispatch(setModalType("BOARD_FORM"))
	}

	return (
		<div>
			<div>
				<h1>Boards</h1>
				{!boardId && userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN") ? (
					<button onClick={addNewBoard}>Add New Board</button>
				) : null}
			</div>
			<Table data={boardInfo} config={config}/>
		</div>
	)
}