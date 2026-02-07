import React from "react"
import { PLACEHOLDER_COLOR } from "../../helpers/constants"

export const BoardPlaceholder = () => {
	return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-4">
			<div className = {`tw-w-full tw-h-24 ${PLACEHOLDER_COLOR}`}></div>	
			<div className = {`tw-w-full tw-h-96 ${PLACEHOLDER_COLOR}`}></div>	
		</div>
	)	
}
