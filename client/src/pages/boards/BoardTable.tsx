import React, {useState} from "react"
import { TicketTable } from "../../components/tickets/TicketTable"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"

export const BoardTable = () => {
	const { boardInfo } = useAppSelector((state) => state.board)
	const [ selectedIds, setSelectedIds ] = useState<Array<number>>([])
	return (
		<TicketTable 
			selectedIds={selectedIds} 
			boardId={boardInfo?.id ?? 0}
			setSelectedIds={setSelectedIds} 
			key={`board-${boardInfo?.name.toLowerCase() ?? ""}`} 
			header={""}
		/>
	)
}
