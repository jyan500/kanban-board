import React from "react"
import "../../styles/textarea.css"
import "react-quill/dist/quill.snow.css"

type Props = {
	rawHTMLString: string	
}

/* Display the converted content from Draft.js, ignoring normalized styles */
export const TextAreaDisplay = ({rawHTMLString}: Props) => {
	return (
		<div className = "ql-editor" dangerouslySetInnerHTML={{ __html: rawHTMLString }}></div>
	)
}

