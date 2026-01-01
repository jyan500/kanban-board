import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { useGetUserProfilesQuery, useLazyGetUserProfilesQuery } from "../../services/private/userProfile"
import { boardApi, useGetBoardTicketsQuery } from "../../services/private/board"
import { useGetSprintsQuery } from "../../services/private/sprint"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Ticket, UserProfile, ViewMode } from "../../types/common"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"
import { BoardFilters, setFilters } from "../../slices/boardFilterSlice"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { useForm, FormProvider } from "react-hook-form"
import { CalendarContainer } from "../../components/boards/CalendarContainer"

export interface FormValues { 
	query: string
	searchBy: string
}

export interface CalendarData {
    id: number
    name: string
    startDate: Date
    endDate: Date
    color: string
    type: "Ticket" | "Sprint"
}

export const BoardCalendar = () => {
	const dispatch = useAppDispatch()
	const { filters } = useAppSelector((state) => state.boardFilter)
	const [calendarData, setCalendarData] = useState<Array<CalendarData>>([])
	const [ page, setPage ] = useState(1)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const [currentDate, setCurrentDate] = useState(new Date())
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const nonCompletedStatuses = statuses.filter((status) => !status.isCompleted).map((status) => status.id) ?? []
	const defaultForm: FormValues = {
		query: "",
		searchBy: "title",
	}
    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { handleSubmit } = methods

	// Get current view period
	const getCurrentPeriod = useMemo(() => {
		return {
			start: startOfMonth(currentDate),
			end: endOfMonth(currentDate)
		}
	}, [currentDate])

	const { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError } = useGetBoardTicketsQuery(boardInfo ? {id: boardInfo.id, urlParams: {
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
		...(filters.statusId == null || !nonCompletedStatuses.includes(filters.statusId) ? {"statusIds": nonCompletedStatuses} : {}),
		startDate: format(getCurrentPeriod.start, "yyyy-MM-dd"),
		endDate: format(getCurrentPeriod.end, "yyyy-MM-dd"),
		"includeAssignees": true, 
		"requireDueDate": true,
		"checkOverlapping": true,
		"page": page,
		"includeRelationshipInfo": true, 
		"limit": true,
	}} : skipToken)

	const { data: sprintData, isLoading: isSprintsLoading, isError: isSprintsError } = useGetSprintsQuery(boardInfo ? {
		urlParams: {
			boardId: boardInfo.id,
			startDate: format(getCurrentPeriod.start, "yyyy-MM-dd"),
			endDate: format(getCurrentPeriod.end, "yyyy-MM-dd"),
			page: page,
			checkOverlapping: true,
			filterInProgress: true,
		}
	} : skipToken)

	// Count active filters for the badge
	const numActiveFilters = Object.values(filters).filter(value => value !== null).length

	const onSubmit = (values: FormValues) => {
		setPage(1)
		setPreloadedValues(values)
	}

	useEffect(() => {
		// reset the page whenever the date range is changed
		setPage(1)
	}, [getCurrentPeriod])

	useEffect(() => {
		if (!isBoardTicketLoading && !isSprintsLoading && sprintData?.data && boardTicketData?.data){
			setCalendarData([
				...sprintData.data.map((sprint) => {
					return {
						id: sprint.id,
						type: "Sprint",
						name: sprint.name,
						startDate: new Date(sprint.startDate),
						endDate: new Date(sprint.endDate),
			            color: "tw-bg-blue-200",
					}
				}), 
				...boardTicketData.data.map((ticket) => {
					return {
						id: ticket.id,
						type: "Ticket",
						name: ticket.name,
						startDate: new Date(ticket.createdAt),
						endDate: new Date(ticket.dueDate),
			            color: "tw-bg-blue-300",
					}
				})
			])
		}
	}, [sprintData, boardTicketData, isSprintsLoading, isBoardTicketLoading])

	return (
		<div className = "tw-relative tw-w-full">
			<FormProvider {...methods}>
				<CalendarContainer
					currentDate={currentDate}
					setCurrentDate={setCurrentDate}
					periodStart={getCurrentPeriod.start}
					periodEnd={getCurrentPeriod.end}
					boardId={boardInfo?.id ?? 0}
					numFilters={numActiveFilters}
					calendarData={calendarData}
					onSubmit={onSubmit}
					isCalendarLoading={(isSprintsLoading && !sprintData) || (isBoardTicketLoading && !boardTicketData)}
				/>
			</FormProvider>
		</div>
	)
}
