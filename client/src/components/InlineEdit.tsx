import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import "../styles/inline-edit.css"

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
	}

	let element: React.ReactElement;
	switch (type){
		case "text":
			element = (
				<input
					{...register(registerField, registerOptions)}
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
					aria-label="editable-field"
					onKeyDown={onKeyDown}
				/>)
			break
	}

	return (
		<div>
			<div className = "inline-edit-element">
				{element}
			</div>
			<div className = "btn-group">
				<button type = "button" onClick={onSubmit}>Save</button>
				<button type = "button" onClick={(e) => {
					resetField(registerField)
					onCancel()
				}
				} className = "--secondary">Cancel</button>
			</div>
		</div>
	)
}