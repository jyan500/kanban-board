import React, { useRef } from "react"
import { DROPDOWN_Z_INDEX } from "../helpers/constants"
import { IconClose } from "./icons/IconClose"

type Props = {
	id?: string
	children: React.ReactNode
	isMobile?: boolean
	closeDropdown?: () => void
	className?: string 
	alignLeft?: boolean
}

export const Dropdown = React.forwardRef<HTMLDivElement, Props>(({alignLeft, className, children, isMobile, closeDropdown,id}, ref) => {
	return (
		<div id={id} ref = {ref} className={`${DROPDOWN_Z_INDEX} ${!isMobile ? `tw-origin-top-right tw-absolute ${alignLeft ? `tw-left-0` : `tw-right-0`} tw-w-56` : "tw-inset-x-0 tw-fixed tw-bottom-0 tw-w-full"} tw-mt-2 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 ${className}`}>
			{isMobile && closeDropdown ? (
				<button 
					className = "tw-absolute tw-top-0 tw-right-0 tw-mr-1 tw-mt-1"
					onClick={(e) => {
						e.preventDefault()
						closeDropdown()
					}}
				>
					<IconClose className = "tw-w-4 tw-h-4"/>
				</button>
			) : null}
			<div className="tw-py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
				{children}
			</div>
		</div>
	)
})

