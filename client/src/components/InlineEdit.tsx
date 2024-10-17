import React, { useState } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
	type: string
	value: string
	onSubmit: () => void
	onCancel: () => void
	registerField: string
	registerOptions: Record<string, any>
}

export const InlineEdit = ({type, value, onSubmit, onCancel, registerField, registerOptions}: Props) => {
	const { handleSubmit, register, resetField, setValue } = useFormContext()

	const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === "Escape"){
			(e.target as HTMLElement).blur()
			setValue(registerField, value)
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
				<textarea 
					rows={10}
					cols={30}
					className = "tw-w-full"
					{...register(registerField, registerOptions)}
					aria-label="editable-field-textarea"
					onKeyDown={onKeyDown}
				>
					
				</textarea>
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
				<button type = "button" className = "button" onClick={(e) => {
					e.preventDefault()
					onSubmit()
				}}>Save</button>
				<button type = "button" onClick={(e) => {
					e.preventDefault()
					resetField(registerField)
					onCancel()
				}
				} className = "button --secondary">Cancel</button>
			</div>
		</div>
	)
}