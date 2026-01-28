import React, {useEffect, useState, useRef, useMemo, useCallback} from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import ReactQuill, {Quill} from "react-quill"
import "quill-mention";
import "react-quill/dist/quill.snow.css"
import "quill-mention/dist/quill.mention.css"
import { useLazyGenericFetchQuery } from "../../services/private/generic"
import { USER_PROFILE_URL } from "../../helpers/urls"

type Props = {
	id?: string
	registerField: string
	registerOptions?: Record<string, any> 
	mentionsEnabled?: boolean
	mentionsUrl?: string
	mentionsUrlParams?: Record<string, any>
}

export const SimpleEditor = ({
	id,
	registerField, 
	registerOptions, 
	mentionsEnabled, 
	mentionsUrl, 
	mentionsUrlParams
}: Props) => {
	const { control, handleSubmit, register, resetField, getValues, setValue } = useFormContext()
	const [ genericFetch ] = useLazyGenericFetchQuery()
	const quillRef = useRef<ReactQuill>(null)

	// modified from: https://github.com/zenoamaro/react-quill/issues/324#issuecomment-1186874701
	const source = useCallback(async (searchTerm: string, renderList: Function, _: string) => {
		/* TODO: figure how to integrate react select with this component (if possible with this library),
			or alternatively figure out how to enable scrolling with pagination, with loading indicators.
		*/
		const {data, pagination} = await genericFetch({
			endpoint: mentionsUrl ?? USER_PROFILE_URL,
			urlParams: 
			mentionsUrlParams ? {...mentionsUrlParams, isMentions: true, query: searchTerm ?? ""} : {
				forSelect: true, 
				query: searchTerm ?? "",
				isMentions: true,
			},
		}).unwrap()
		renderList(data, searchTerm)
	}, [])

	const modules = useMemo(() => {
        return {
            ...(mentionsEnabled ? {mention: {
                allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/, 
                mentionDenotationChars: ["@"],
                source: source,
                // isolateCharacter and fixMentionsToQuill prevents interference
                // with future keyboard handling libraries
	            isolateCharacter: false,
	            fixMentionsToQuill: false,
	            positioningStrategy: 'normal',
	            onOpen: () => true,
	            onClose: () => true, 
            }} : {}),
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
                ["link", "code"],
                ["clean"],
            ]
        }
    }, [mentionsEnabled, source])

	return (
		<div id="quillContainer">
			<Controller
				name={registerField}
				rules={registerOptions}
				control={control}
				render={({field}) => (
					<ReactQuill 
						id={id}
						ref={quillRef}
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

