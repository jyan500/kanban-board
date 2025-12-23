import React from "react"

interface Props {
	numRows?: number
}

export const RowPlaceholder = ({numRows=3}: Props) => {
	return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 tw-p-2">
			<div className = "tw-w-32 tw-h-6 tw-bg-gray-200"></div>
			{
				Array.from({length: numRows}).map((_, i) => {
					return (
						<div key={`row-placeholder-${i}`} className = "tw-w-full tw-h-8 tw-bg-gray-200"></div>
					)
				})	
			}
		</div>
	)
}
