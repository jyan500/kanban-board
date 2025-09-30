import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { useGetUserProfilesQuery, useLazyGetUserProfilesQuery } from "../../services/private/userProfile"
import { boardApi, useGetBoardTicketsQuery } from "../../services/private/board"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Ticket, UserProfile, ViewMode } from "../../types/common"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"
import { BoardFilters, setFilterButtonState, setFilters } from "../../slices/boardFilterSlice"
import { ScheduleContainer } from "../../components/boards/ScheduleContainer"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"

export const BoardSchedule = () => {
	const dispatch = useAppDispatch()
	const { filters } = useAppSelector((state) => state.boardFilter)
	const [ page, setPage ] = useState(1)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('week')
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const [ ticketsGroupedByAssignee, setTicketsGroupedByAssignee ] = useState<Record<string, any>>({})
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id) ?? []
	const { data: boardTicketData, isFetching: isBoardTicketFetching, isError: isBoardTicketError } = useGetBoardTicketsQuery(boardInfo && filters.startDate != null && filters.endDate != null ? {id: boardInfo.id, urlParams: {
		// only include the filters that aren't null
		...(Object.keys(filters).reduce((acc: Record<string, any>, key) => {
			const typedKey = key as keyof BoardFilters
			if (filters[typedKey] == null){
				acc[typedKey] = "" 
			}
			else {
				acc[typedKey] = filters[typedKey]
			}
			return acc	
		}, {} as Record<string, any>)),
		...(filters.statusId == null || !completedStatuses.includes(filters.statusId) ? {"excludeCompleted": true} : {}),
		"includeAssignees": true, 
		"requireDueDate": true,
		"checkOverlapping": true,
		"page": page,
		"includeRelationshipInfo": true, 
		"limit": true,
	}} : skipToken)

	// Get current view period
	const getCurrentPeriod = useMemo(() => {
		switch (viewMode) {
			case 'week':
				return {
					start: startOfWeek(currentDate),
					end: endOfWeek(currentDate)
				}
			case 'month':
				return {
					start: startOfMonth(currentDate),
					end: endOfMonth(currentDate)
				}
			default:
				return {
					start: startOfWeek(currentDate),
					end: endOfWeek(currentDate)
				}
		}
	}, [viewMode, currentDate])

	useEffect(() => {
		dispatch(setFilters({
			...filters,
			startDate: format(getCurrentPeriod.start, "yyyy-MM-dd"),
			endDate: format(getCurrentPeriod.end, "yyyy-MM-dd"),
		}))
	}, [getCurrentPeriod])

	return (
		<div className = "tw-relative tw-w-full">
			<ScheduleContainer 
				currentDate={currentDate}
				setCurrentDate={setCurrentDate}
				viewMode={viewMode} 
				periodStart={getCurrentPeriod.start}
				periodEnd={getCurrentPeriod.end}
				setViewMode={setViewMode} 
				setPage={setPage}
				currentPage={page}
				ticketsData={boardTicketData}
			/>
		</div>
	)
}
