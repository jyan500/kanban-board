import React from "react"
import { Controller, Control, FieldValues } from "react-hook-form"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg"
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { stateToHTML } from 'draft-js-export-html'; 


type Props = {
	registerField: string
	registerOptions?: Record<string, any> 
	toolbarOptions?: Record<string, any>
	// TODO: find the proper type for this, there's a conflict between the generic "FieldValues" type, and the "FormValues"
	// type that gets passed in when initializing useForm() for react hook form.
	control: Control<any, object> 
}

export const TextArea = ({registerField, registerOptions, toolbarOptions, control}: Props) => {
	const defaultToolbarOptions = {
	    options: ['inline', 'blockType', 'list', 'link', 'emoji', 'image', 'remove', 'history'],
	    inline: {
	      inDropdown: false,
	      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
	    },
	    list: {
	      inDropdown: true,
	      options: ['unordered', 'ordered', 'indent', 'outdent'],
	    },
	    textAlign: {
	      inDropdown: true,
	      options: ['left', 'center', 'right', 'justify'],
	    },
	    link: {
	    	defaultToolbarOptions: "_blank"
	    },
    }
	return (
		<Controller 
			name={registerField} 	
			control={control}
			rules={registerOptions}
			render={({field: {value, onChange}}) => (
				<Editor 
					editorState={value} 
					onEditorStateChange={onChange}
					wrapperClassName="tw-border tw-p-1 tw-border-gray-300"
				    editorClassName="tw-p-1"
				    toolbar={toolbarOptions ?? defaultToolbarOptions}
				/>
			)}
		/>
	)
}