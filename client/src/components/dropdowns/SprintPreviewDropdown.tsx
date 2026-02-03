import React, { useState, useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import type { CalendarData } from "../../pages/boards/BoardCalendar"
import { IconCycle } from "../icons/IconCycle"
import { IconPencil } from "../icons/IconPencil"
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice"
import { format } from "date-fns"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

type Props = {
	closeDropdown: () => void
    sprint: CalendarData
	boardId: number
	isMobile?: boolean
}

export const SprintPreviewDropdown = React.forwardRef<HTMLDivElement, Props>(({isMobile, closeDropdown, sprint, boardId}: Props, ref) => {
	const dispatch = useAppDispatch()
	return (
		<Dropdown alignLeft={true} className = "tw-top-4" isMobile = {isMobile} ref = {ref}>
            <div className = "tw-p-2 tw-flex tw-flex-col tw-gap-y-4">
				<div className = "tw-flex tw-flex-row tw-justify-between tw-items-center">
					<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
						<IconCycle className = "tw-w-4 tw-h-4"/>
						<p className={SECONDARY_TEXT}>{sprint.name}</p>
					</div>
					<button onClick={() => {
						
						dispatch(setModalType("SPRINT_FORM"))
						dispatch(setModalProps({
							 boardId: boardId,
							 sprintId: sprint.id,
						 }))
						dispatch(toggleShowModal(true))
						closeDropdown()
					}}><IconPencil/></button>
				</div>
				<div className = "tw-flex tw-flex-row tw-items-center tw-justify-between">
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<p className = {`tw-text-sm ${PRIMARY_TEXT}`}>Start</p>
						<p className={SECONDARY_TEXT}>{format(sprint.startDate, "MMM dd, yyyy")}</p>
					</div>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<p className = {`tw-text-sm ${PRIMARY_TEXT}`}>End</p>
						<p className={SECONDARY_TEXT}>{format(sprint.endDate, "MMM dd, yyyy")}</p>
					</div>
				</div>
			</div>
		</Dropdown>
	)	
})

