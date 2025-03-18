import React from "react"
import { BulkEditOperation, BulkEditOperationKey } from "./BulkActionsForm"

interface Props {
	step: number
	setStep: (step: number) => void
	numSelectedIssues: number
	operation: BulkEditOperationKey | null | undefined
	setOperation: (operation: BulkEditOperationKey | null | undefined) => void
	operations: Array<BulkEditOperation>
	isAdminOrBoardAdmin: boolean
	skipStep3: boolean
}

export const BulkActionsFormStep2 = ({step, setStep, skipStep3, numSelectedIssues, operation: propOperation, setOperation, operations, isAdminOrBoardAdmin}: Props) => {
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 2 of 4: Choose Operation</h3>
			<p>Choose the operation you wish to perform on <span className = "tw-font-semibold">{numSelectedIssues}</span> issues</p>
			<div>
				{operations.map((operation, index) => {
					if (operation.key === "remove-issues" && !isAdminOrBoardAdmin){
						return <></>
					}
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
				<button onClick={() => {
					if (step+1 === 3 && skipStep3){
						setStep(step+2)
					}
					else {
						setStep(step+1)
					}
				}} disabled={!propOperation} className = "button">Next</button>			
				<button onClick={() => setStep(step-1)} className = "button --secondary">Cancel</button>			
			</div>
		</div>
	)
}
