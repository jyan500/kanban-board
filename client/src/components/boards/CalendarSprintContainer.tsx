import React, { useState, useRef } from "react"
import type { CalendarData } from "../../pages/boards/BoardCalendar"
import { SprintPreviewDropdown } from "../dropdowns/SprintPreviewDropdown"
import { IconCycle } from "../icons/IconCycle"
import { useClickOutside } from "../../hooks/useClickOutside"

interface Props {
    data: CalendarData & {startCol: number, span: number}
    boardId: number
    uniqueKey: string
}

export const CalendarSprintContainer = ({data, boardId, uniqueKey}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    useClickOutside(dropdownRef, () => setIsDropdownOpen(false), buttonRef)
    return (
        <div
            key={uniqueKey}
            className="tw-relative tw-grid tw-grid-cols-7 tw-gap-0"
            style={{ gridColumn: `1 / -1` }}
        >
            <button
                ref={buttonRef}
                onClick={(e) => {
                    setIsDropdownOpen(!isDropdownOpen)
                }}
                /* The pointer events auto ensures that the button can still be clicked, even though the absolutely positioned parent has pointer-events-none,
                in order to allow the cell below it to be clicked. */ 
                className={`${data.color} ${data.hoverColor} tw-rounded tw-px-2 tw-py-1 tw-font-medium tw-text-xs tw-flex tw-items-center tw-pointer-events-auto`}
                style={{
                    gridColumn: `${data.startCol + 1} / span ${data.span}`
                }}
            >
                <span className="tw-mr-1"><IconCycle/></span>
                {data.name}
            </button>
            {
                isDropdownOpen ? 
                /* the dropdown also needs pointer events auto to prevent the click from being eaten by the parent's pointer-events-none*/
                <div className = "tw-pointer-events-auto">
                    <SprintPreviewDropdown ref={dropdownRef} closeDropdown={() => setIsDropdownOpen(false)} boardId={boardId} sprint={data}/>
                </div>
                : null
            }
        </div>
    )
}
