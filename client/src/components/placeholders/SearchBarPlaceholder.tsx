import React from "react"

export const SearchBarPlaceholder = () => {
	return (
	<div className = "tw-w-full tw-py-4 tw-flex tw-flex-col tw-gap-y-2 xl:tw-gap-x-2 lg:tw-flex-row lg:tw-flex-wrap lg:tw-justify-between lg:tw-items-center">
		<div className = "tw-flex tw-flex-row tw-justify-between lg:tw-justify-normal lg:tw-items-center tw-gap-x-2">
			<div className = "tw-w-96 tw-h-6 tw-bg-gray-200"></div>
			<div className = "tw-bg-gray-200 tw-w-16 tw-h-10"></div>
		</div>
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-items-center lg:tw-gap-x-2">
			<div className = "tw-w-16 tw-h-10 tw-bg-gray-200"></div>
			<div className = "tw-w-16 tw-h-10 tw-bg-gray-200"></div>
		</div>
	</div>
	)	
}
