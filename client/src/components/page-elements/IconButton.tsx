import React from "react"

interface Props {
	className?: string,
	onClick: (e: React.MouseEvent) => void
}

export const IconButton = ({className, onClick, children}: React.PropsWithChildren<Props>) => {
	return (
		<button
            className={`${className ?? "hover:tw-opacity-60 tw-bg-white tw-text-gray-800 tw-cursor-pointer"}`}
            onClick={onClick}
        >
        {children}
        </button>

	)
}		
