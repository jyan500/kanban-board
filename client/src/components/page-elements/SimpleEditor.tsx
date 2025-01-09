import React, {useEffect, useState, useCallback} from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import ReactQuill, {Quill} from "react-quill"
import "quill-mention";
import "react-quill/dist/quill.snow.css"

type Props = {
	registerField: string
	registerOptions?: Record<string, any> 
}

export const SimpleEditor = ({registerField, registerOptions}: Props) => {
	const { control, handleSubmit, register, resetField, getValues, setValue } = useFormContext()
	const modules = {
		mention: {
			allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/, 
			mentionDenotationChars: ["@"],
			source: useCallback((searchTerm: string, renderList: Function, mentionChar: string) => {
				const atValues = [
					{ id: 1, value: "Fredrik Sundqvist" },
					{ id: 2, value: "Patrik Sjölin" },
					{ id: 3, value: "Ludwig Beethoven" },
				]
				if (searchTerm.length === 0){
					renderList(atValues, searchTerm)
				}
				else {
					const matches = []
					for (let i = 0; i < atValues.length; ++i){
						// const matched = atValues[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
						if (~atValues[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())){
							matches.push(atValues[i])
						}
					}
					renderList(matches, searchTerm)
				}
			}, [])
		},
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

