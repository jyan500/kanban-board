import React from "react"
import { PLACEHOLDER_COLOR } from "../../helpers/constants"

interface Props {
	numRows?: number
}

export const RowPlaceholder = ({numRows=3}: Props) => {
	return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 tw-p-2">
			<div className = {`tw-w-32 tw-h-6 ${PLACEHOLDER_COLOR}`}></div>
			{
				Array.from({length: numRows}).map((_, i) => {
					return (
						<div key={`row-placeholder-${i}`} className = {`tw-w-full tw-h-8 ${PLACEHOLDER_COLOR}`}></div>
					)
				})	
			}
		</div>
	)
}
