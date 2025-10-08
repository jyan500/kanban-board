import React from "react"
import { Button } from "./Button"
import { IconFilter } from "../icons/IconFilter"
import { Badge } from "./Badge"

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    theme?: string 
    children?: React.ReactNode
    onClick: () => void
    filterButtonState: boolean
    numFilters: number

}

export const FilterButton = React.forwardRef<HTMLButtonElement, Props>(({theme="secondary", children, filterButtonState, onClick, numFilters, ...props}, ref) => {

    return (
        <Button {...props} theme={theme} onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClick()
        }}>
            <div className = "tw-flex tw-flex-row tw-gap-x-2">
                <IconFilter className = {`${filterButtonState ? "tw-text-primary" : ""}`}/>
                <span>Filters</span>
                {filterButtonState && numFilters > 0 ? <Badge className = "tw-w-4 tw-h-4 tw-text-white tw-bg-primary tw-flex tw-flex-row tw-justify-center tw-items-center"><span className = "tw-text-xs tw-font-semibold">{numFilters}</span></Badge> : null}
                {children}
            </div>
        </Button>
    )
})
