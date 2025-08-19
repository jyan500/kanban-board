import React, {useState} from "react"
import { TicketTable } from "../../components/tickets/TicketTable"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"

export const BoardTable = () => {
	const { boardInfo } = useAppSelector((state) => state.board)
	const dispatch = useAppDispatch()
	const [ selectedIds, setSelectedIds ] = useState<Array<number>>([])
	return (
		<TicketTable 
			selectedIds={selectedIds} 
			boardId={boardInfo?.id ?? 0}
			setSelectedIds={setSelectedIds} 
			bulkEditAction={(ids: Array<number>) => {
				dispatch(setModalType("BULK_ACTIONS_MODAL"))
				dispatch(setModalProps({
					boardId: boardInfo?.id ?? 0,
					initSelectedIds: selectedIds,
					// default to step 2 since we've selected ids to edit
					initStep: 2
				}))
				dispatch(toggleShowModal(true))
			}}
			key={`board-${boardInfo?.name.toLowerCase() ?? ""}`} 
			header={""}
		/>
	)
}
