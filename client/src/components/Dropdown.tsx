import React from "react"
export const Dropdown = () => {
	return (
		<div className="tw-origin-top-right tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5">
			<div className="tw-py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
				<a
					href="#"
					className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
					role="menuitem"
				>
					Option 1
				</a>
				<a
					href="#"
					className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
					role="menuitem"
				>
					Option 2
				</a>
				<a
					href="#"
					className="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
					role="menuitem"
				>
					Option 3
				</a>
			</div>
		</div>
	)
}
