import React from "react"
import { BulkActionsForm } from "../bulk-actions/BulkActionsForm"

interface Props {
	boardId: number | null | undefined
}

export const BulkActionsModal = ({boardId}: Props) => {
	return (
		<BulkActionsForm boardId={boardId}/>
	)
}
