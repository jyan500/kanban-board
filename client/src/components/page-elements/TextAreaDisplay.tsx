import React from "react"
import "../../styles/textarea.css"
import { PRIMARY_TEXT, FADE_ANIMATION, STANDARD_BORDER } from "../../helpers/constants"

type Props = {
	rawHTMLString: string	
	isEditable?: boolean
}

/* Display the converted content from Draft.js, ignoring normalized styles */
export const TextAreaDisplay = ({isEditable, rawHTMLString}: Props) => {
	return (
		<div className = {`${isEditable ? "editable" : ""} ${isEditable ? `${FADE_ANIMATION} hover:tw-bg-gray-100` : ""} dark:tw-bg-white tw-rounded-md ${STANDARD_BORDER} quill-display ql-editor`
		} dangerouslySetInnerHTML={{ __html: rawHTMLString }}>

		</div>
	)
}

