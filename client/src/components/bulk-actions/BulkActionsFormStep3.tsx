import React from "react"
import { BulkEditFormValues, BulkEditOperationKey } from "./BulkActionsForm"
import { MoveTicketForm, FormValues as MoveTicketFormValues } from "../forms/MoveTicketForm"

interface Props {
	step: number
	setStep: (step: number) => void
	operation: BulkEditOperationKey | null | undefined
	boardId: number | null | undefined
	selectedIds: Array<number>
	formValues: BulkEditFormValues
	setFormValues: (values: BulkEditFormValues) => void
}

export const BulkActionsFormStep3 = ({step, setStep, operation, boardId, selectedIds, formValues, setFormValues}: Props) => {

	const renderOperation = () => {
		switch (operation){
			case "move-issues":
				return (
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{operationComponents["move-issues"]}
					</div>
				)
		}
	}

	const moveTicketSubmit = async (values: MoveTicketFormValues) => {
		setStep(step+1)
		setFormValues({
			selectedTicketIds: selectedIds,
			currentBoardId: boardId,
			...values
		})
	}

	const buttonBar = () => {
		return (
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button className = "button" type = "submit">Next</button>
				<button onClick={(e) => {
					e.preventDefault()
					setStep(step-1)
				}} className = "button --secondary">Cancel</button>
			</div>
		)	
	}

	const operationComponents = {
		"move-issues": <MoveTicketForm step={step} formValues={{
			boardIdOption: formValues.boardIdOption,
			shouldUnlink: formValues.shouldUnlink
		}} numSelectedIssues={selectedIds.length} onSubmit={moveTicketSubmit} boardId={boardId} title={"Move Issues"} buttonBar={buttonBar()}/>,
		"edit-issues": "",
		"delete-issues": "",
		"watch-issues": "",
		"stop-watching-issues": "",
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 3 of 4: Operation Details</h3>
			{renderOperation()}
		</div>
	)
}