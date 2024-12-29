import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { TextArea } from "./page-elements/TextArea"
import { LoadingButton } from "./page-elements/LoadingButton"

type Props = {
	type: string
	value?: string
	onSubmit: () => void
	onCancel: () => void
	customReset?: () => void
	registerField: string
	registerOptions: Record<string, any>
	isLoading?: boolean
}

export const InlineEdit = ({isLoading, type, value, onSubmit, onCancel, customReset, registerField, registerOptions}: Props) => {
	const { control, handleSubmit, register, resetField, setValue } = useFormContext()

	const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === "Escape"){
			(e.target as HTMLElement).blur()
			setValue(registerField, value ?? "")
		}	
		if (e.key == "Enter" && type !== "textarea"){
			e.preventDefault()
		}
	}

	let element: React.ReactElement;
	switch (type){
		case "text":
			element = (
				<input
					{...register(registerField, registerOptions)}
					className = "tw-w-full"
					type="text"
					aria-label="editable-field-text"
					onKeyDown={onKeyDown}
				/>
			)
			break
		case "textarea":
			element = (
				<TextArea
					control={control}
					registerField={registerField}
					registerOptions={registerOptions}
				/>
			)
			break
		default:
			element = (<input
					{...register(registerField, registerOptions)}
					type="text"
					className = "tw-w-full"
					aria-label="editable-field"
					onKeyDown={onKeyDown}
				/>)
			break
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<div>
				{element}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton isLoading={isLoading} className = "button" text={"Save"} onClick={(e) => {
					e.preventDefault()
					onSubmit()
				}}></LoadingButton>
				<button type = "button" onClick={(e) => {
					e.preventDefault()
					customReset ? customReset() : resetField(registerField)
					onCancel()
				}
				} className = "button --secondary">Cancel</button>
			</div>
		</div>
	)
}