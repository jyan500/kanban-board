import React from "react"
import { FADE_ANIMATION, NAVLINK_HOVER, NAVLINK_TEXT } from "../../helpers/constants"

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive: boolean
	children: React.ReactNode
}

export const TabButton = React.forwardRef<HTMLButtonElement, TabButtonProps>(({isActive, children, ...props}, ref) => {
	return (
		<button 
		ref={ref} 
		{...props} 
		className = {`tw-p-1.5 tw-rounded-sm tw-font-semibold ${NAVLINK_HOVER} ${isActive ? `${NAVLINK_TEXT} tw-font-bold` : "dark:tw-text-white "} ${FADE_ANIMATION}`}>
			{children}
		</button>
	)
})
