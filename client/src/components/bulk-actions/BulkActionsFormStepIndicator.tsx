import React from "react"
import { IconButton } from "../page-elements/IconButton"

interface Props {
	currentStep: number
	step: number
	setStep: (step: number) => void
	text: string
	Icon: React.ReactNode
	disabled?: boolean
}

export const BulkActionsFormStepIndicator = ({currentStep, setStep, step, text, Icon, disabled}: Props) => {
	return (
		<li className = {`${step === currentStep ? "tw-font-bold" : ""} tw-flex tw-flex-row tw-items-center tw-gap-x-2`}><IconButton disabled={disabled} className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2" onClick={() => {
			if (currentStep >= step){
				setStep(step)
			}
		}} >{Icon}<span>{text}</span></IconButton></li>
	)
}
