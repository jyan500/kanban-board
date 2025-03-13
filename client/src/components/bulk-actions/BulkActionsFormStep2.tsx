import React from "react"
import { BulkEditOperation, BulkEditOperationKey } from "./BulkActionsForm"

interface Props {
	step: number
	setStep: (step: number) => void
	numSelectedIssues: number
	operation: BulkEditOperationKey | null | undefined
	setOperation: (operation: BulkEditOperationKey | null | undefined) => void
}

export const BulkActionsFormStep2 = ({step, setStep, numSelectedIssues, operation: propOperation, setOperation}: Props) => {
	const operations: Array<BulkEditOperation> = [
		{
			key: "edit-issues",
			text: "Edit Issues",
			description: "Edit Field Values of Issues",
		},
		{
			key: "move-issues",
			text: "Move Issues",
			description: "Move issues to new boards",
		},
		{
			key: "delete-issues",
			text: "Delete Issues",
			description: "Permanently delete issues",
		},
		{
			key: "watch-issues",
			text: "Watch Issues",
			description: "Watch all selected issues",
		},
		{
			key: "stop-watching-issues",
			text: "Stop Watching Issues",
			description: "Stop watching all selected issues"
		}
	]
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 2 of 4: Choose Operation</h3>
			<p>Choose the operation you wish to perform on <span className = "tw-font-semibold">{numSelectedIssues}</span> issues</p>
			<div>
				{operations.map((operation, index) => {
					return (
						<div key={operation.key} className = {`${index === 0 ? "tw-border-y" : "tw-border-b"} tw-flex tw-flex-row tw-py-2 tw-gap-x-4 tw-border-gray-300`} >
							<div>
								<input onChange={() => setOperation(operation.key as BulkEditOperationKey)} value={operation.key} checked={propOperation === operation.key} type = "radio"/>	
							</div>
							<div className = "tw-flex tw-flex-1">
								<p>{operation.text}</p>
							</div>
							<div className = "tw-flex tw-flex-1">
								<p>{operation.description}</p>
							</div>
						</div>
					)
				})}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button onClick={() => setStep(step+1)} disabled={!propOperation} className = "button">Next</button>			
				<button onClick={() => setStep(step-1)} className = "button --secondary">Cancel</button>			
			</div>
		</div>
	)
}