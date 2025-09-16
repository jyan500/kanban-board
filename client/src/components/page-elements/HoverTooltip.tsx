import React from "react"

interface Props {
	text: string
	width?: string
}

/* CSS only tooltip that displays text and appears on hover only */
export const HoverTooltip = ({text, width}: Props) => {
	return (
	    <div className={`tw-absolute tw-bottom-full tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-mb-2 tw-px-2 tw-py-1 tw-text-sm tw-text-white tw-bg-gray-900 tw-rounded tw-opacity-0 tw-invisible group-hover:tw-opacity-100 group-hover:tw-visible tw-transition-all tw-duration-200 tw-pointer-events-none ${width ? width : "tw-w-max"}`}>
	        <span className = "tw-w-full tw-text-wrap">{text}</span>
	        <div className="tw-absolute tw-top-full tw-left-1/2 tw-transform -tw-translate-x-1/2 tw-w-0 tw-h-0 tw-border-l-4 tw-border-r-4 tw-border-t-4 tw-border-transparent tw-border-t-gray-900"></div>
	    </div>
    )
}
