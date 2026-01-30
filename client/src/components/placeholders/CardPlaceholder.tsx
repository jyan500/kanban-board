import React from "react"
import { PLACEHOLDER_COLOR } from "../../helpers/constants"

interface Props {
	hasImage?: boolean
}

export const CardPlaceholder = ({hasImage}: Props) => {
	return (
		<div className = "tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-gap-y-2">
			{
				hasImage ? 	
					<div className = "tw-flex tw-flex-row tw-justify-center">
						<div className = {`${PLACEHOLDER_COLOR} tw-w-32 tw-h-32 tw-rounded-full`}></div>				
					</div>
				: null
			}
			<div className = "tw-p-2">
				<div className = {`tw-w-64 tw-h-32 ${PLACEHOLDER_COLOR}`}></div>
			</div>
		</div>	
	)
}
