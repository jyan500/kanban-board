import React, { useState, useEffect, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { Scheduler, SchedulerData, SchedulerProjectData } from "@bitnoi.se/react-scheduler";
import { useGetUserProfilesQuery, useLazyGetUserProfilesQuery } from "../../services/private/userProfile"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Ticket, UserProfile } from "../../types/common"
import { format, toDate, isWithinInterval, isBefore, isAfter } from "date-fns"
import { colorMap } from "../../components/Ticket"
import { BoardScheduleFilters, setFilterButtonState, setFilters } from "../../slices/boardScheduleSlice"
import "@bitnoi.se/react-scheduler/dist/style.css";

type SchedulerRow = {
	id: string
	label: {
		icon: string;
		title: string;
		subtitle: string;
	}
	data: SchedulerProjectData[]
};

export const BoardSchedule = () => {
	const dispatch = useAppDispatch()
	const { filters, filterButtonState } = useAppSelector((state) => state.boardSchedule)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const completeStatusId = statuses.find((status) => status.name === "Complete")?.id ?? 0
	const { data: boardTicketData, isFetching: isBoardTicketFetching, isError: isBoardTicketError } = useGetBoardTicketsQuery(boardInfo ? {id: boardInfo.id, urlParams: {
		// only include the filters that aren't null
		...(Object.keys(filters).reduce((acc: Record<string, any>, key) => {
			const typedKey = key as keyof BoardScheduleFilters
			if (filters[typedKey] != null){
				acc[typedKey] = filters[typedKey]
			}
			return acc	
		}, {} as Record<string, any>)),
		...(filters.statusId !== completeStatusId ? {"excludeStatusId": completeStatusId} : {}),
		"skipPaginate": true, 
		"includeAssignees": true, 
		"requireDueDate": true,
		"includeRelationshipInfo": true, 
		"limit": true,
	}} : skipToken)
	const [ scheduleData, setScheduleData ] = useState<SchedulerData>([])
	const [ filteredScheduleData, setFilteredScheduleData ] = useState<SchedulerData>([])
	const [ filterUser, setFilterUser ] = useState<string>("")
	const [ range, setRange ] = useState({
		startDate: new Date(),
		endDate: new Date(),
	})

	const [triggerGetUsers, { data: users, isFetching, isError }] = useLazyGetUserProfilesQuery()

	const groupTicketsByAssignee = (ticketData: Array<Ticket>) => {
		return ticketData.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
			ticket.assignees?.forEach((user: Pick<UserProfile, "id" | "firstName" | "lastName">) => {
				if (user.id in acc){
					acc[user.id].push(ticket)
				}	
				else {
					acc[user.id] = [ticket]
				}
			})
			return acc
		}, {})
	}


	useEffect(() => {
		if (!isBoardTicketFetching && boardTicketData){
			const ticketsGroupedByAssignee = groupTicketsByAssignee(boardTicketData?.data ?? [])
			triggerGetUsers({userIds: Object.keys(ticketsGroupedByAssignee)})
		}
	}, [isBoardTicketFetching])


	useEffect(() => {
		if (!isFetching && users){
			const parsedData = parseTicketDataForScheduler()
			setScheduleData(parsedData)
		}
	}, [isFetching, users])

	const handleRangeChange = useCallback((range: {startDate: Date, endDate: Date}) => {
		setRange(range)
	}, [])

	const filterData = useCallback((scheduledData: SchedulerData) => {

	}, [range, boardTicketData])

	const parseTicketDataForScheduler = useCallback(() => {
		const schedulerData: SchedulerData = []
		const ticketsGroupedByAssignee = groupTicketsByAssignee(boardTicketData?.data ?? [])
		Object.keys(ticketsGroupedByAssignee).forEach((id: string) => {
			const groupedTickets = ticketsGroupedByAssignee[id]
			const firstName = groupedTickets[0]?.assignees?.[0].firstName
			const lastName = groupedTickets[0]?.assignees?.[0].lastName
			const ticketData: Array<SchedulerProjectData> = []
			groupedTickets.forEach((obj: Ticket) => {
				const priority = priorities.find((priority) => priority.id === obj.priorityId)?.name ?? ""
				/* occupancy is in seconds, so convert from minutes to seconds */
				const data = {
					id: obj.id.toString(),
					title: obj.name,
					occupancy: 0,
					startDate: new Date(obj.createdAt),
					endDate: new Date(obj.dueDate),
					subtitle: ticketTypes.find((ticketType) => ticketType.id === obj.ticketTypeId)?.name ?? "",
					description: statuses.find((status) => status.id === obj.statusId)?.name ?? "",
					bgColor: priority !== "" ? colorMap[priority] : "",
				}
				ticketData.push(data)
			})
			schedulerData.push({
				id: id,
				label: {
					icon: users?.data?.find((user: UserProfile) => user.id.toString() === id)?.imageUrl,	
					title: `${firstName} ${lastName}`,
					subtitle: "",
				},
				data: ticketData
			} as SchedulerRow)
		})
		return schedulerData
	}, [board, boardTicketData, users])

	return (
		<div className = "tw-relative tw-w-full tw-h-[60vh]">
			<Scheduler 
				data={scheduleData}
				isLoading={isBoardTicketFetching || isFetching}
				onRangeChange={handleRangeChange}
				onItemClick={(leftItem) => {
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
			/>
		</div>
	)
}