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
            className={`${className ?? "tw-bg-transparent tw-text-gray-800 tw-cursor-pointer"} ${disabled ? "tw-opacity-20" : "hover:tw-opacity-60"}`}
            onClick={onClick}
        >
        {children}
        </button>

	)
}		
