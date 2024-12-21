import React, { useRef } from "react"
import { DROPDOWN_Z_INDEX } from "../helpers/constants"

type Props = {
	children: React.ReactNode
	className?: string 
}

export const Dropdown = React.forwardRef<HTMLDivElement, Props>(({className, children}, ref) => {
	return (
		<div ref = {ref} className={`${DROPDOWN_Z_INDEX} tw-origin-top-right tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 ${className}`}>
			<div className="tw-py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
				{children}
			</div>
		</div>
	)
})

