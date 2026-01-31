import React from "react"
import "../../styles/textarea.css"
import "react-quill/dist/quill.snow.css"
import { PRIMARY_TEXT, STANDARD_BORDER } from "../../helpers/constants"

type Props = {
	rawHTMLString: string	
}

/* Display the converted content from Draft.js, ignoring normalized styles */
export const TextAreaDisplay = ({rawHTMLString}: Props) => {
	return (
		<div className = {`dark:!tw-pl-2 dark:tw-bg-gray-50 tw-bg-white quill-display ql-editor`} dangerouslySetInnerHTML={{ __html: rawHTMLString }}></div>
	)
}

