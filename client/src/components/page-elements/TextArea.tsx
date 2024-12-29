import React from "react"
import { Controller, Control, FieldValues } from "react-hook-form"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import Editor from "@draft-js-plugins/editor"
import createToolbarPlugin, { Separator } from "@draft-js-plugins/static-toolbar"
import '@draft-js-plugins/static-toolbar/lib/plugin.css'
import 'draft-js/dist/Draft.css';
import { stateToHTML } from 'draft-js-export-html'; 
import "../../styles/textarea.css"
import {
	ItalicButton,
	BoldButton,
	UnderlineButton,
	CodeButton,
	UnorderedListButton,
	OrderedListButton,
	BlockquoteButton,
	CodeBlockButton,
} from "@draft-js-plugins/buttons"


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
	return (
		<Controller 
			name={registerField} 	
			control={control}
			rules={registerOptions}
			render={({field: {value, onChange}}) => (
				<div className = "__editor-block">
					<Toolbar>
					{
						(externalProps) => (
							<>
								<BoldButton {...externalProps} />
				                <ItalicButton {...externalProps} />
				                <UnderlineButton {...externalProps} />
				                <CodeButton {...externalProps} />
				                <Separator/>
				                <UnorderedListButton {...externalProps} />
				                <OrderedListButton {...externalProps} />
				                <BlockquoteButton {...externalProps} />
				                <CodeBlockButton {...externalProps} />		
							</>
						)
					}	
					</Toolbar>
					<Editor 
						editorState={value} 
						onChange={onChange}
						plugins={plugins}
					/>
				</div>
			)}
		/>
	)
}
