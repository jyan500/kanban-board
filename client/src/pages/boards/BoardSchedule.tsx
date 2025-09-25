import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { useGetUserProfilesQuery, useLazyGetUserProfilesQuery } from "../../services/private/userProfile"
import { boardApi, useGetBoardTicketsQuery } from "../../services/private/board"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ScheduleTask, Ticket, UserProfile, ViewMode } from "../../types/common"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"
import { colorMap } from "../../components/Ticket"
import { BoardFilters, setFilterButtonState, setFilters } from "../../slices/boardFilterSlice"
import { GanttChart } from "../../components/boards/ScheduleContainer"

export const BoardSchedule = () => {
	const dispatch = useAppDispatch()
	const { filters } = useAppSelector((state) => state.boardFilter)
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
		"skipPaginate": true, 
		"includeAssignees": true, 
		"requireDueDate": true,
		"checkOverlapping": true,
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

	const parseTicketsToTasks = () => {
		if (boardTicketData){
			return boardTicketData.data.map((ticket) => {
				const priority = priorities.find((priority) => priority.id === ticket.priorityId)?.name ?? ""
				const { id, name } = ticket
				return {
					id: id.toString(),
					name,
					startDate: new Date(ticket.createdAt),
					endDate: new Date(ticket.dueDate),
					color: priority !== "" ? colorMap[priority] : ""
				}
			})
		}
		return []
	}

	// const [ scheduleData, setScheduleData ] = useState<SchedulerData>([])
	// const [ filteredScheduleData, setFilteredScheduleData ] = useState<SchedulerData>([])
	// const [ filterUser, setFilterUser ] = useState<string>("")
	// const [ range, setRange ] = useState({
	// 	startDate: new Date(),
	// 	endDate: new Date(),
	// })

	// const [triggerGetUsers, { data: users, isFetching, isError }] = useLazyGetUserProfilesQuery()

	// const groupTicketsByAssignee = (ticketData: Array<Ticket>) => {
	// 	return ticketData.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
	// 		ticket.assignees?.forEach((user: Pick<UserProfile, "id" | "firstName" | "lastName">) => {
	// 			if (user.id in acc){
	// 				acc[user.id].push(ticket)
	// 			}	
	// 			else {
	// 				acc[user.id] = [ticket]
	// 			}
	// 		})
	// 		return acc
	// 	}, {})
	// }

	// useEffect(() => {
	// 	if (!isBoardTicketFetching && boardTicketData){
	// 		const ticketsGroupedByAssignee = groupTicketsByAssignee(boardTicketData?.data ?? [])
	// 		triggerGetUsers({userIds: Object.keys(ticketsGroupedByAssignee)})
	// 	}
	// }, [isBoardTicketFetching])

	// useEffect(() => {
	// 	if (!isFetching && users){
	// 		const parsedData = parseTicketDataForScheduler()
	// 		setScheduleData(parsedData)
	// 	}
	// }, [isFetching, users])

	// const handleRangeChange = useCallback((range: {startDate: Date, endDate: Date}) => {
	// 	setRange(range)
	// }, [])

	// const filterData = useCallback((scheduledData: SchedulerData) => {

	// }, [range, boardTicketData])

	// const parseTicketDataForScheduler = useCallback(() => {
	// 	const schedulerData: SchedulerData = []
	// 	const ticketsGroupedByAssignee = groupTicketsByAssignee(boardTicketData?.data ?? [])
	// 	Object.keys(ticketsGroupedByAssignee).forEach((id: string) => {
	// 		const groupedTickets = ticketsGroupedByAssignee[id]
	// 		const firstName = groupedTickets[0]?.assignees?.[0].firstName
	// 		const lastName = groupedTickets[0]?.assignees?.[0].lastName
	// 		const ticketData: Array<SchedulerProjectData> = []
	// 		groupedTickets.forEach((obj: Ticket) => {
	// 			const priority = priorities.find((priority) => priority.id === obj.priorityId)?.name ?? ""
	// 			/* occupancy is in seconds, so convert from minutes to seconds */
	// 			const data = {
	// 				id: obj.id.toString(),
	// 				title: obj.name,
	// 				occupancy: 0,
	// 				startDate: new Date(obj.createdAt),
	// 				endDate: new Date(obj.dueDate),
	// 				subtitle: ticketTypes.find((ticketType) => ticketType.id === obj.ticketTypeId)?.name ?? "",
	// 				description: statuses.find((status) => status.id === obj.statusId)?.name ?? "",
	// 				bgColor: priority !== "" ? colorMap[priority] : "",
	// 			}
	// 			ticketData.push(data)
	// 		})
	// 		schedulerData.push({
	// 			id: id,
	// 			label: {
	// 				icon: users?.data?.find((user: UserProfile) => user.id.toString() === id)?.imageUrl,	
	// 				title: `${firstName} ${lastName}`,
	// 				subtitle: "",
	// 			},
	// 			data: ticketData
	// 		} as SchedulerRow)
	// 	})
	// 	return schedulerData
	// }, [board, boardTicketData, users])

	return (
		<div className = "tw-relative tw-w-full">
			{/* <Scheduler 
				data={scheduleData}
				isLoading={isBoardTicketFetching || isFetching}
				onRangeChange={handleRangeChange}
				onItemClick={(leftItem) => {
					// resetting backend filters method
					if (filterUser === ""){
						setFilterUser(leftItem.id)
						dispatch(setFilterButtonState(1))
						dispatch(setFilters({
							...filters,
							assignee: Number(leftItem.id),
						}))
					}
					// click on the item again to unset the filter
					else if (filterUser === leftItem.id){
						setFilterUser("")
						dispatch(setFilters({
							...filters,
							assignee: null,
						}))
						dispatch(setFilterButtonState(Object.entries(filters).filter((entry) => entry[0] !== "assignee").every((entry) => entry[1] == null) ? 0 : 1))
						dispatch(boardApi.util.invalidateTags(["BoardTickets"]))
					}
				}}
				onTileClick={(clickedResource) => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("EDIT_TICKET_FORM"))
					dispatch(selectCurrentTicketId(Number(clickedResource.id)))
				}}
				onFilterData={() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalProps({boardId: boardInfo?.id ?? 0}))
					dispatch(setModalType("BOARD_SCHEDULE_FILTER_MODAL"))
				}}
				onClearFilterData={() => {
				}}
				config={{
					// default to show days display
					zoom: 1,	
					showTooltip: false,
					filterButtonState,
				}}
			/> */}
			<GanttChart 
				currentDate={currentDate}
				setCurrentDate={setCurrentDate}
				viewMode={viewMode} 
				periodStart={getCurrentPeriod.start}
				periodEnd={getCurrentPeriod.end}
				setViewMode={setViewMode} 
				tasks={parseTicketsToTasks()}
			/>
		</div>
	)
}
