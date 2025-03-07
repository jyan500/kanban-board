import React, {useEffect, useState} from "react"
import { IconCircleCheckmark } from "../icons/IconCircleCheckmark"
import { BulkActionsFormStep1 } from "./BulkActionsFormStep1" 
import { BulkActionsFormStep2 } from "./BulkActionsFormStep2" 
import { BulkActionsFormStep3 } from "./BulkActionsFormStep3" 
import { BulkActionsFormStep4 } from "./BulkActionsFormStep4" 

interface Props {
	boardId: number | null | undefined
}

export const BulkActionsForm = ({boardId}: Props) => {
	const [step, setStep] = useState(1)
	const [selectedIds, setSelectedIds] = useState<Array<number>>([])

	const renderStep = () => {
		switch (step){
			case 1:
				return <BulkActionsFormStep1 
					step={step} 
					setStep={setStep} 
					selectedIds={selectedIds} 
					setSelectedIds={setSelectedIds} 
					boardId={boardId}
				/>
			case 2:
				return <BulkActionsFormStep2/>
			case 3:
				return <BulkActionsFormStep3/>
			case 4:
				return <BulkActionsFormStep4/>
		}	
	}

	return (
		<div className = "tw-flex tw-flex-col tw-w-full">
			<h1>Bulk Actions</h1>	
			<div className = "tw-flex tw-flex-col lg:tw-flex-row">
				<div className = "lg:tw-w-1/4">
					<ol>
						<li className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2"><IconCircleCheckmark/>Choose Issues</li>
						<li className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2"><IconCircleCheckmark/>Choose Operation</li>
						<li className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2"><IconCircleCheckmark/>Operation Details</li>
						<li className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2"><IconCircleCheckmark/>Confirmation</li>
					</ol>
				</div>
				<div className = "tw-flex tw-flex-1">
					{
						renderStep()
					}	
				</div>
			</div>
		</div>
	)
}