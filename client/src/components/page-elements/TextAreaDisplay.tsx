import React from "react"
import "../../styles/textarea.css"

type Props = {
	rawHTMLString: string	
}

/* Display the converted content from Draft.js, ignoring normalized styles */
export const TextAreaDisplay = ({rawHTMLString}: Props) => {
	return (
		<div className = "__editor-block" dangerouslySetInnerHTML={{ __html: rawHTMLString }}></div>
	)
}

