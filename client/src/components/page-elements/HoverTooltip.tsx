import React from "react"
import { HOVER_Z_INDEX } from "../../helpers/constants"

interface Props {
	text: string
	width?: string
	direction?: 'top' | 'left' | 'bottom' | 'right'
}

/* CSS only tooltip that displays text and appears on hover only */
export const HoverTooltip = ({text, width, direction = 'top'}: Props) => {
    let tooltipClasses = ""
    let arrowClasses = ""

	/*
	how this works:
	a w-0 h-0 element with a border creates a triangle
	giving all three border directions a size but transparent will hide the triangles, but then leave
	the one direction you want with a color

	tw-bottom-full tw-left-1/2 -tw-translate-x-1/2 controls the positioning of the arrow itself relative to the tooltip
	*/
    switch (direction) {
        case 'bottom':
            tooltipClasses = "tw-top-full tw-left-1/2 -tw-translate-x-1/2 tw-mt-2"
            arrowClasses = "tw-bottom-full tw-left-1/2 -tw-translate-x-1/2 tw-border-l-4 tw-border-r-4 tw-border-transparent tw-border-b-4 tw-border-b-gray-900"
            break
        case 'left':
            tooltipClasses = "tw-right-full tw-top-1/2 -tw-translate-y-1/2 tw-mr-2"
            arrowClasses = "tw-left-full tw-top-1/2 -tw-translate-y-1/2 tw-border-t-4 tw-border-b-4 tw-border-transparent tw-border-l-4 tw-border-l-gray-900"
            break
        case 'right':
            tooltipClasses = "tw-left-full tw-top-1/2 -tw-translate-y-1/2 tw-ml-2"
            arrowClasses = "tw-right-full tw-top-1/2 -tw-translate-y-1/2 tw-border-t-4 tw-border-b-4 tw-border-transparent tw-border-r-4 tw-border-r-gray-900"
            break
        case 'top':
        default:
            tooltipClasses = "tw-bottom-full tw-left-1/2 -tw-translate-x-1/2 tw-mb-2"
            arrowClasses = "tw-top-full tw-left-1/2 -tw-translate-x-1/2 tw-border-l-4 tw-border-r-4 tw-border-transparent tw-border-t-4 tw-border-t-gray-900"
            break
    }

	return (
	    <div className={`${HOVER_Z_INDEX} tw-absolute tw-px-2 tw-py-1 tw-text-sm tw-text-white tw-bg-gray-900 tw-rounded tw-opacity-0 tw-invisible group-hover:tw-opacity-100 group-hover:tw-visible tw-transition-all tw-duration-200 tw-pointer-events-none ${width ? width : "tw-w-max"} ${tooltipClasses}`}>
	        <span className = "tw-w-full tw-text-wrap">{text}</span>
	        <div className={`tw-absolute tw-w-0 tw-h-0 ${arrowClasses}`}></div>
	    </div>
    )
}