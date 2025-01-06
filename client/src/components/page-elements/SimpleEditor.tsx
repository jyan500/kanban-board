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
	return (
		<Controller
			name={registerField}
			rules={registerOptions}
			control={control}
			render={({field}) => (
				<ReactQuill 
					theme = "snow" 
					value={field.value} 
					onChange={(text) => {
						field.onChange(text)
					}}
				/>
			)}
		/>
	)
}

