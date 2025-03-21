import React from "react"

type FilterButtonProps = {
	isActive: boolean
	onClick: (e: React.MouseEvent) => void
	children: React.ReactNode
}

export const FilterButton = ({isActive, onClick, children}: FilterButtonProps) => {
	return (
		<button className = {`tw-p-1.5 tw-rounded-sm tw-font-semibold hover:tw-bg-light-primary hover:tw-text-primary ${isActive ? "tw-text-primary tw-bg-light-primary tw-font-bold" : ""} tw-transition tw-duration-100 tw-ease-in-out`} onClick={onClick}>{children}</button>
	)
}
