import React, {useEffect, useState} from "react"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import Editor from "@draft-js-plugins/editor"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import createToolbarPlugin, { Separator } from "@draft-js-plugins/static-toolbar"
import createLinkPlugin from "@draft-js-plugins/anchor"
import createLinkifyPlugin, {extractLinks} from "@draft-js-plugins/linkify"
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import linkifyEditorState from "../../helpers/linkifyEditorState"
import '@draft-js-plugins/static-toolbar/lib/plugin.css'
import "@draft-js-plugins/anchor/lib/plugin.css"
import '@draft-js-plugins/linkify/lib/plugin.css';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css'
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
}

/* 
https://github.com/draft-js-plugins/draft-js-plugins/issues/1802#issuecomment-911386164
typescript hack for inline toolbar link plugin type error
*/
interface OverrideContentProps {
  getEditorState: () => EditorState
  setEditorState: (editorState: EditorState) => void
  onOverrideContent: (content: React.ComponentType<unknown> | undefined) => void
}

type OverrideOnOverrideContent = (
  content: React.ComponentType<OverrideContentProps> | undefined
) => void

export const textAreaValidation = (field: string) => {
	return {
		validate: {
	    	// check if the rich text editor contains any text excluding whitespaces
	        required: (value: EditorState) => {
		        if (!value.getCurrentContent().hasText() && !(value.getCurrentContent().getPlainText().length > 0)){
		        	return `${field} is required`
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
		},
	}
	return options
}

export const convertEditorStateToHTML = (state: EditorState) => {
	return stateToHTML(state.getCurrentContent(), stateToHTMLOptions())
}

const linkPlugin = createLinkPlugin({linkTarget: "_blank"})
const linkifyPlugin = createLinkifyPlugin();
const staticToolbarPlugin = createToolbarPlugin()
const inlineToolbarPlugin = createInlineToolbarPlugin();
const { Toolbar } = staticToolbarPlugin
const plugins = [inlineToolbarPlugin, staticToolbarPlugin, linkPlugin, linkifyPlugin]

export const TextArea = ({registerField, registerOptions, toolbarOptions}: Props) => {
	const { control, handleSubmit, register, resetField, getValues, setValue } = useFormContext()
	/* 
	this is a hack in order to support anchor tags within the editor. For some reason when using the React Hook Form Controller
	and relying on control,
	the anchor tags are not added when adding links. Therefore, had to pass the FormContext through, and set a new editor state 
	each time a change is made. This could have negative effects on efficiency down the road.
	TODO: would be replacing draft.js with a different library
	Also whenever the react hotload refreshes, it causes a store.getItem(...) undefined error which has not been addressed yet.
	*/
	const [editorState, setEditorState] = useState(EditorState.createWithContent(getValues(registerField).getCurrentContent()));

	const onChangeEditor = (newEditorState: EditorState) => {
		const linkifiedEditorState = linkifyEditorState(newEditorState)
		setEditorState(linkifiedEditorState)
		setValue(registerField, linkifiedEditorState)
	}

	return (
		<div className = "__editor">
			{/* Controller is still necessary for validation */}
			<Controller
				name={registerField} 	
				control={control}
				rules={registerOptions}
				render={() => {
					return (
						<>
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
								editorState={editorState} 
								onChange={onChangeEditor}
								plugins={plugins}
							/>
							<inlineToolbarPlugin.InlineToolbar>
						    {
						        (externalProps) => (
									<>
										<BoldButton {...externalProps} />
										<ItalicButton {...externalProps} />
										<UnderlineButton {...externalProps} />
										<CodeButton {...externalProps} />
										<linkPlugin.LinkButton {...externalProps} onOverrideContent={
											externalProps.onOverrideContent as OverrideOnOverrideContent  
										}/> 
									</>
						        )
						    }
						    </inlineToolbarPlugin.InlineToolbar>
					    </>
					)	
				}}
			/>
		</div>
	)
}

