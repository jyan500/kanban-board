import React from "react"
import { BulkActionsForm } from "../bulk-actions/BulkActionsForm"

interface Props {
	boardId: number | null | undefined
	initSelectedIds?: Array<number>
	initStep?: number
}

export const BulkActionsModal = ({boardId, initSelectedIds=[], initStep=1}: Props) => {
	return (
		<BulkActionsForm boardId={boardId} initStep={initStep} initSelectedIds={initSelectedIds}/>
	)
}
