import React from "react"

type FilterButtonProps = {
	isActive: boolean
	onClick: (e: React.MouseEvent) => void
	children: React.ReactNode
}

export const FilterButton = ({isActive, onClick, children}: FilterButtonProps) => {
	return (
		<button className = {`tw-p-1.5 tw-rounded-sm tw-font-semibold hover:tw-bg-sky-50 hover:tw-text-primary ${isActive ? "tw-text-primary tw-bg-sky-50 tw-font-bold" : ""}`} onClick={onClick}>{children}</button>
	)
}