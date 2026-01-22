import React, { useEffect } from "react"
import { BulkEditFormValues, BulkEditOperationKey } from "./BulkActionsForm"
import { MoveTicketForm, FormValues as MoveTicketFormValues } from "../forms/MoveTicketForm"
import { AddTicketForm, AddTicketFormValues } from "../AddTicketForm"
import { useAppSelector } from "../../hooks/redux-hooks"
import { Button } from "../page-elements/Button"

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
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)

	const renderOperation = () => {
		switch (operation){
			case "move-issues":
				return (
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{operationComponents["move-issues"]}
					</div>
				)
			case "edit-issues":
				return operationComponents["edit-issues"]
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

	const editTicketSubmit = async (values: AddTicketFormValues) => {
		setStep(step+1)
		setFormValues(values)
	}

	const buttonBar = () => {
		return (
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<Button theme="primary" type = "submit">Next</Button>
				<Button theme="secondary" onClick={(e) => {
					e.preventDefault()
					setStep(step-1)
				}} >Cancel</Button>
			</div>
		)	
	}

	const operationComponents = {
		"move-issues": <MoveTicketForm step={step} formValues={{
			boardIdOption: formValues.boardIdOption,
			shouldUnlink: formValues.shouldUnlink
		}} numSelectedIssues={selectedIds.length} onSubmit={moveTicketSubmit} boardId={boardId} title={"Move Issues"} buttonBar={buttonBar()}/>,
		"edit-issues": <AddTicketForm step={step} formValues={{
			statusId: formValues.statusId,
			priorityId: {label: priorities.find((priority) => formValues.priorityId === priority.id)?.name ?? "", value: formValues.priorityId.toString()},
			userIdOption: formValues.userIdOption,
			ticketTypeId: {label: "", value: ""},
			description: "",
			name: "",
		}} title={"Edit Issues"} onSubmit={editTicketSubmit} buttonBar={buttonBar()} boardId={boardId} isBulkAction={true} statusesToDisplay={statuses}/>,
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 3 of 4: Operation Details</h3>
			{renderOperation()}
		</div>
	)
}
