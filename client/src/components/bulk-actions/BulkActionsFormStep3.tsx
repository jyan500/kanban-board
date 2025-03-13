import React from "react"
import { BulkEditOperationKey } from "./BulkActionsForm"
import { MoveTicketForm, FormValues as MoveTicketFormValues } from "../forms/MoveTicketForm"

interface Props {
	step: number
	setStep: (step: number) => void
	operation: BulkEditOperationKey | null | undefined
	boardId: number | null | undefined
}

export const BulkActionsFormStep3 = ({step, setStep, operation, boardId}: Props) => {

	const renderOperation = () => {
		console.log("operation: ", operation)
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

	}

	const operationComponents = {
		"move-issues": <MoveTicketForm onSubmit={moveTicketSubmit} boardId={boardId} title={"Move Tickets"}/>,
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