import React from "react"
import { BulkEditOption, BulkEditOptionKey } from "./BulkActionsForm"

interface Props {
	step: number
	setStep: (step: number) => void
	numSelectedIssues: number
	operation: BulkEditOptionKey | null | undefined
	setOperation: (option: BulkEditOptionKey | null | undefined) => void
}

export const BulkActionsFormStep2 = ({step, setStep, numSelectedIssues, operation, setOperation}: Props) => {
	const options: Array<BulkEditOption> = [
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
				{options.map((option, index) => {
					return (
						<div key={option.key} className = {`${index === 0 ? "tw-border-y" : "tw-border-b"} tw-flex tw-flex-row tw-py-2 tw-gap-x-4 tw-border-gray-300`} >
							<div>
								<input onChange={() => setOperation(option.key as BulkEditOptionKey)} value={option.key} checked={operation === option.key} type = "radio"/>	
							</div>
							<div className = "tw-flex tw-flex-1">
								<p>{option.text}</p>
							</div>
							<div className = "tw-flex tw-flex-1">
								<p>{option.description}</p>
							</div>
						</div>
					)
				})}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button onClick={() => setStep(step+1)} disabled={!operation} className = "button">Next</button>			
				<button onClick={() => setStep(step-1)} className = "button --secondary">Cancel</button>			
			</div>
		</div>
	)
}