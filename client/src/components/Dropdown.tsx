import React, { useRef } from "react"

type Props = {
	children: React.ReactNode
}

export const Dropdown = React.forwardRef<HTMLDivElement, Props>(({children}, ref) => {
	return (
		<div ref = {ref} className="tw-origin-top-right tw-z-1000 tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5">
			<div className="tw-py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
				{children}
			</div>
		</div>
	)
})

