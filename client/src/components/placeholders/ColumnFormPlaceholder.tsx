import React from "react"

/* Placeholder for loading a regular column based form with full width inputs */
export const ColumnFormPlaceholder = () => {
	return (
		<div className = "tw-w-full tw-flex-col tw-flex tw-gap-y-2">
			<div className = "tw-bg-gray-200 tw-h-6 tw-w-32">
			</div>	
			<div className = "tw-h-12 tw-w-full tw-flex tw-flex-col tw-gap-y-2">
				<div className = "tw-bg-gray-100 tw-h-4 tw-w-32"></div>
				<div className = "tw-w-full tw-h-6 tw-bg-gray-200"></div>
			</div>	
			<div className = "tw-h-12 tw-w-full tw-flex tw-flex-col tw-gap-y-2">
				<div className = "tw-bg-gray-100 tw-h-4 tw-w-32"></div>
				<div className = "tw-w-full tw-h-6 tw-bg-gray-200"></div>
			</div>	
		</div>
	)
}