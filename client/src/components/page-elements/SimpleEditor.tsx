import React, {useEffect, useState} from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"


type Props = {
	registerField: string
	registerOptions?: Record<string, any> 
}


export const SimpleEditor = ({registerField, registerOptions}: Props) => {
	const { control, handleSubmit, register, resetField, getValues, setValue } = useFormContext()
	const modules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			[{ 'color': [] }],
			[{ 'font': [] }],
			[{ 'align': [] }],
			["bold", "italic", "underline", "strike", "blockquote"],
			[
				{ list: "ordered" },
				{ list: "bullet" },
				{ indent: "-1" },
				{ indent: "+1" }
			],
			["link", "code-block"],
			["clean"],
		]
	}
	return (
		<div id="quillContainer">
			<Controller
				name={registerField}
				rules={registerOptions}
				control={control}
				render={({field}) => (
					<ReactQuill 
						modules={modules}
						/* prevent quill popups from going out of bounds*/
						bounds={'#quillContainer'}
						theme = "snow" 
						value={field.value} 
						onChange={(text) => {
							field.onChange(text)
						}}
					/>
				)}
			/>
		</div>
	)
}

