import React from "react"

interface Props {
	hasImage?: boolean
}

export const CardPlaceholder = ({hasImage}: Props) => {
	return (
		<div className = "tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-gap-y-2">
			{
				hasImage ? 	
					<div className = "tw-flex tw-flex-row tw-justify-center">
						<div className = "tw-bg-gray-200 tw-w-32 tw-h-32 tw-rounded-full"></div>				
					</div>
				: null
			}
			<div className = "tw-p-2">
				<div className = "tw-w-64 tw-h-32 tw-bg-gray-200"></div>
			</div>
		</div>	
	)
}