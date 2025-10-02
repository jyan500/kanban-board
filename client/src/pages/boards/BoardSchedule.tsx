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
import { useForm, FormProvider } from "react-hook-form"

export interface FormValues { 
	query: string
	searchBy: string
}

export const BoardSchedule = () => {
	const dispatch = useAppDispatch()
	const { filters, filterButtonState } = useAppSelector((state) => state.boardFilter)
	const [ page, setPage ] = useState(1)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('week')
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const [ ticketsGroupedByAssignee, setTicketsGroupedByAssignee ] = useState<Record<string, any>>({})
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id) ?? []
	const defaultForm: FormValues = {
		query: "",
		searchBy: "title",
	}
    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { handleSubmit } = methods
	const { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError } = useGetBoardTicketsQuery(boardInfo && filters.startDate != null && filters.endDate != null ? {id: boardInfo.id, urlParams: {
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
		...preloadedValues,
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

	const onSubmit = (values: FormValues) => {
		setPage(1)
		setPreloadedValues(values)
	}

	useEffect(() => {
		// reset the page whenever the date range is changed
		setPage(1)
		dispatch(setFilters({
			...filters,
			startDate: format(getCurrentPeriod.start, "yyyy-MM-dd"),
			endDate: format(getCurrentPeriod.end, "yyyy-MM-dd"),
		}))
	}, [getCurrentPeriod])

	return (
		<div className = "tw-relative tw-w-full">
			<FormProvider {...methods}>
				<ScheduleContainer 
					onSubmit={onSubmit}
					currentDate={currentDate}
					setCurrentDate={setCurrentDate}
					viewMode={viewMode} 
					periodStart={getCurrentPeriod.start}
					filterButtonState={filterButtonState}
					isTicketsLoading={isBoardTicketLoading}
					periodEnd={getCurrentPeriod.end}
					boardId={boardInfo?.id ?? 0}
					setViewMode={setViewMode} 
					setPage={setPage}
					currentPage={page}
					ticketsData={boardTicketData}
				/>
			</FormProvider>
		</div>
	)
}
