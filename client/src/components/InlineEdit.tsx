import React, { useState } from "react"
import "../styles/inline-edit.css"

type Props = {
	type: string
	value: string
	setValue: (val: string) => void
	onCancel: () => void
}

export const InlineEdit = ({type, value, setValue, onCancel}: Props) => {
	const [editingValue, setEditingValue] = useState(value)

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
					type="text"
					aria-label="editable-field-text"
					value={value}
					onChange={onTextInputChange}
					onKeyDown={onKeyDown}
				/>
			)
			break
		case "textarea":
			element = (
				<textarea 
					aria-label="editable-field-textarea"
					value={value}
					onChange={onTextAreaChange}
					onKeyDown={onKeyDown}
				>
					
				</textarea>
			)
			break
		default:
			element = (<input
					type="text"
					aria-label="editable-field"
					value={value}
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