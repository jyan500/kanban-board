import React from "react"
import { TicketRow } from "../../components/TicketRow"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { BacklogContainer } from "../../components/boards/BacklogContainer"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BoardScheduleFilters } from "../../slices/boardScheduleSlice"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useGetSprintsQuery } from "../../services/private/sprint"

export const BoardBacklog = () => {
    const dispatch = useAppDispatch()
	const { filters, filterButtonState } = useAppSelector((state) => state.boardSchedule)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const { data: sprints, isFetching, isLoading, isError} = useGetSprintsQuery({urlParams: {}})
	const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id) ?? []

    return (
		<div className = "tw-w-full tw-flex tw-flex-row">
			<BacklogContainer boardId={boardInfo?.id ?? 0}/>
		</div>
    )
}