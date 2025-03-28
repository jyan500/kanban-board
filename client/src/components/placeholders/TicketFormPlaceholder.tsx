import React from "react"

export const TicketFormPlaceholder = () => {
	return (
		<div className = "tw-flex tw-flex-col tw-h-full tw-w-full tw-gap-y-2">
			<div className = "tw-flex tw-flex-col tw-w-full tw-h-full tw-gap-y-4 lg:tw-flex-row lg:tw-gap-x-4">
				<div className = "tw-break-words tw-h-full tw-w-full lg:tw-w-2/3 tw-flex tw-flex-col tw-gap-y-2">
					<div className = "tw-w-full tw-h-8 tw-bg-gray-100"></div>
					<div className = "tw-w-full tw-h-full tw-bg-gray-200"></div>
				</div>
				<div className = "tw-w-full tw-h-full tw-flex-col tw-flex tw-gap-y-2 lg:tw-w-1/3 tw-mt-8 lg:tw-mt-0">
					<div className = "tw-w-full tw-h-8 tw-bg-gray-100"></div>
					<div className = "tw-w-full tw-h-full tw-bg-gray-200"></div>
				</div>
			</div>
		</div>
	)
}

