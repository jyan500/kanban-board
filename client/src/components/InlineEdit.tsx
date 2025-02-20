import React, { useState } from "react"
import { Controller, useForm, FormProvider, useFormContext } from "react-hook-form"
import { TextArea } from "./page-elements/TextArea"
import { LoadingButton } from "./page-elements/LoadingButton"
import { SimpleEditor } from "./page-elements/SimpleEditor"

type Props = {
	type: string
	value?: string
	onSubmit: () => void
	onCancel: () => void
	customReset?: () => void
	registerField: string
	registerOptions: Record<string, any>
	isLoading?: boolean
	mentionsEnabled?: boolean
	minDate?: string
	maxDate?: string
}

export const InlineEdit = (
	{
		isLoading, 
		type, 
		value, 
		onSubmit, 
		onCancel, 
		customReset, 
		registerField, 
		registerOptions, 
		mentionsEnabled,
		minDate,
		maxDate
	}: Props) => {
	const methods = useFormContext()
	const { control, handleSubmit, register, resetField, getValues, setValue } = methods

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
		case "date":
			element = (
				<input
					{...register(registerField, registerOptions)}
					className = "tw-w-full"
					type={"date"}
					aria-label="editable-field-date"
					min={minDate ?? ""}
					max={maxDate ?? ""}
					onKeyDown={onKeyDown}
				/>
			)
			break
		case "number":
		case "text":
			element = (
				<input
					{...register(registerField, registerOptions)}
					className = "tw-w-full"
					type={type}
					aria-label="editable-field-text"
					onKeyDown={onKeyDown}
				/>
			)
			break
		case "textarea":
			element = (
				<FormProvider {...methods}>
					<SimpleEditor
						registerField={registerField}
						registerOptions={registerOptions}
						mentionsEnabled={mentionsEnabled}
					/>
				</FormProvider>
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