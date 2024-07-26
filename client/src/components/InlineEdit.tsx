import React, { useState } from "react"

type Props = {
	value: string
	setValue: (val: string) => void
	onCancel: () => void
}

export const InlineEdit = ({value, setValue, onCancel}: Props) => {
	const [editingValue, setEditingValue] = useState(value)
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditingValue(e.target.value)
	}
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "Escape"){
			(e.target as HTMLElement).blur()
			setEditingValue(value)
		}	
	}
	return (
		<div className = "form-row">
			<input
				type="text"
				aria-label="editable-field"
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
			/>
			<div className = "btn-group">
				<button onClick={(e) => setValue(editingValue)}>Save</button>
				<button onClick={onCancel} className = "--alert">Cancel</button>
			</div>
		</div>
	)
}