import React, {useState, useEffect} from "react"
import { TicketTable } from "../tickets/TicketTable"
import { Button } from "../page-elements/Button"

interface Props {
	boardId: number | null | undefined
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	step: number
	setStep: (step: number) => void
	closeModal: () => void
}

export const BulkActionsFormStep1 = ({boardId, step, setStep, selectedIds, setSelectedIds, closeModal}: Props) => {
	return (
		<TicketTable
			boardId={boardId}
			header={"Step 1 of 4: Choose Tickets"}
			selectedIds={selectedIds}
			setSelectedIds={setSelectedIds}
			tableClassName={"tw-h-96 tw-overflow-y-auto"}
			key={"bulk-actions"}
			stepButtonRow={
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
 					<Button theme="primary" disabled={selectedIds.length === 0} onClick={() => setStep(step+1)} >Next</Button>	
 					<Button theme="secondary" onClick={closeModal} >Cancel</Button>	
 				</div>
			}
		/>
	)
}
