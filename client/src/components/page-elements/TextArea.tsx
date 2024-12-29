import React from "react"
import { Controller, Control, FieldValues } from "react-hook-form"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
// import { Editor } from "react-draft-wysiwyg"
import Editor from "@draft-js-plugins/editor"
import createToolbarPlugin from "@draft-js-plugins/static-toolbar"
import '@draft-js-plugins/static-toolbar/lib/plugin.css'
import 'draft-js/dist/Draft.css';
// import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { stateToHTML } from 'draft-js-export-html'; 
import "../../styles/textarea.css"


type Props = {
	registerField: string
	registerOptions?: Record<string, any> 
	toolbarOptions?: Record<string, any>
	// TODO: find the proper type for this, there's a conflict between the generic "FieldValues" type, and the "FormValues"
	// type that gets passed in when initializing useForm() for react hook form.
	control: Control<any, object> 
}

export const textAreaValidation = () => {
	return {
		validate: {
	    	// check if the rich text editor contains any text excluding whitespaces
	        required: (value: EditorState) => {
		        if (!value.getCurrentContent().hasText() && !(value.getCurrentContent().getPlainText().length > 0)){
		        	return "Description is required"
		        } 	
	        }
		}
    }
}

export const convertEditorStateToJSON = (state: EditorState) => {
	return JSON.stringify(convertToRaw(state.getCurrentContent()))
}

export const convertJSONToEditorState = (jsonString: string) => {
	return EditorState.createWithContent(convertFromRaw(JSON.parse(jsonString)))
}

/**
 * @return options for converting Draft.js content state to HTML
 */
export const stateToHTMLOptions = () => {
	let options = {
		// TODO: find the right type for entity
		entityStyleFn: (entity: Record<string, any>) => {
			const entityType = entity.get('type').toLowerCase();
			if (entityType === 'link') {
				const data = entity.getData();
				return {
					element: 'a',
					attributes: {
						href: data.url,
						target:'_blank'
					},
				}
			} 
		}
	}
	return options
}

export const convertEditorStateToHTML = (state: EditorState) => {
	return stateToHTML(state.getCurrentContent(), stateToHTMLOptions())
}

const staticToolbarPlugin = createToolbarPlugin()
const { Toolbar } = staticToolbarPlugin
const plugins = [staticToolbarPlugin]

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
				<div className = "__editor-block">
					<Toolbar/>
					<Editor 
						editorState={value} 
						onChange={onChange}
						plugins={plugins}
						// wrapperClassName="tw-border tw-p-1 tw-border-gray-300"
					    // editorClassName="tw-p-1"
					    // toolbar={toolbarOptions ?? defaultToolbarOptions}
					/>
				</div>
			)}
		/>
	)
}
