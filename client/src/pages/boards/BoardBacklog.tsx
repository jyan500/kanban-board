import React, {useState, useEffect} from "react"
import { TicketRow } from "../../components/TicketRow"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { BacklogContainer } from "../../components/boards/BacklogContainer"
import { SprintContainer } from "../../components/boards/SprintContainer"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BoardScheduleFilters } from "../../slices/boardScheduleSlice"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useGetSprintsQuery } from "../../services/private/sprint"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"

export const BoardBacklog = () => {
    const dispatch = useAppDispatch()
	const { filters, filterButtonState } = useAppSelector((state) => state.boardSchedule)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id) ?? []
	const [ backlogTicketIds, setBacklogTicketIds ] = useState<Array<number>>([])
	const [ sprintTicketIds, setSprintTicketIds ] = useState<Array<number>>([])
	const [ itemIds, setItemIds ] = useState<Array<number>>([])

	// in order for ease of use with the existing bulk edit toolbar, track a "combined" array of both 
	// selected backlog and sprint tickets
	const setId = (id: number, items: Array<number>, setter: (items: Array<number>) => void) => {
		if (items.includes(id)){
			setter(items.filter((itemId) => itemId !== id))
		}
		else {
			setter([...items, id])
		}
	}

    return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-4">
			<BulkEditToolbar itemIds={itemIds} updateIds={(ids: Array<number>) => {
				setItemIds(ids)
				setSprintTicketIds(ids)
				setBacklogTicketIds(ids)
			}}>
				<>
					<button className = "button">Edit Tickets</button>
					{
						backlogTicketIds.length ?
						<button className = "button">Move {backlogTicketIds.length} ticket(s) to Sprint</button>
						: null
					}
					{
						sprintTicketIds.length ? 
						<button className = "button">Remove {sprintTicketIds.length} ticket(s) from Sprint</button>
						: null
					}
				</>
			</BulkEditToolbar>
			<SprintContainer setItemId={(id: number) => {
				setId(id, sprintTicketIds, setSprintTicketIds)
				setId(id, itemIds, setItemIds)
			}} itemIds={sprintTicketIds} boardId={boardInfo?.id ?? 0}/>
			<BacklogContainer setItemId={(id: number) => {
				setId(id, backlogTicketIds, setBacklogTicketIds)
				setId(id, itemIds, setItemIds)
			}} itemIds={backlogTicketIds} boardId={boardInfo?.id ?? 0}/>
		</div>
    )
}