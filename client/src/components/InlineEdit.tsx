import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import "../styles/inline-edit.css"

type Props = {
	type: string
	value: string
	setValue: (val: string) => void
	onCancel: () => void
	registerField: string
	registerOptions: Record<string, any>
}

export const InlineEdit = ({type, value, setValue, onCancel, registerField, registerOptions}: Props) => {
	const [editingValue, setEditingValue] = useState(value)
	const { register } = useFormContext()

	const onTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditingValue(e.target.value)
	}

	const onTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditingValue(e.target.value)
	}

	const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === "Enter" || e.key === "Escape"){
			(e.target as HTMLElement).blur()
			setEditingValue(value)
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
					onChange={onTextInputChange}
					onKeyDown={onKeyDown}
				/>
			)
			break
		case "textarea":
			element = (
				<textarea 
					{...register(registerField, registerOptions)}
					aria-label="editable-field-textarea"
					onChange={onTextAreaChange}
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
					onChange={onTextInputChange}
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
				<button onClick={(e) => setValue(editingValue)}>Save</button>
				<button onClick={onCancel} className = "--alert">Cancel</button>
			</div>
		</div>
	)
}