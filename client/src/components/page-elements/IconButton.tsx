import React from "react"

interface Props {
	className?: string,
	disabled?: boolean
	onClick: (e: React.MouseEvent) => void
}

export const IconButton = ({className, disabled, onClick, children}: React.PropsWithChildren<Props>) => {
	return (
		<button
			disabled={disabled}
            className={`${className ?? "hover:tw-opacity-60 tw-bg-transparent tw-text-gray-800 tw-cursor-pointer"}`}
            onClick={onClick}
        >
        {children}
        </button>

	)
}		
