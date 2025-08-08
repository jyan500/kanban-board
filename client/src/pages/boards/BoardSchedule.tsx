import React, { useState, useEffect, useCallback } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { Scheduler, SchedulerData, SchedulerProjectData } from "@bitnoi.se/react-scheduler";
import { useGetUserProfilesQuery } from "../../services/private/userProfile"
import { toggleShowModal, setModalType } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Ticket, UserProfile } from "../../types/common"
import { format, toDate, isWithinInterval, isBefore, isAfter } from "date-fns"
import { colorMap } from "../../components/Ticket"
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
	const [ filterButtonState, setFilterButtonState ] = useState(0)
	const { board, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
	const [ scheduleData, setScheduleData ] = useState<SchedulerData>([])
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const completeStatusId = statuses.find((status) => status.name === "Complete")?.id ?? 0
	const { priorities } = useAppSelector((state) => state.priority)
	const [ range, setRange ] = useState({
		startDate: new Date(),
		endDate: new Date(),
	})

	const groupTicketsByAssignee = useCallback(() => {
		return tickets.reduce((acc: Record<string, Array<Ticket>>, ticket: Ticket) => {
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
	}, [tickets])

	const ticketsGroupedByAssignee = groupTicketsByAssignee()
	const { data: users, isFetching, isError } = useGetUserProfilesQuery(Object.keys(ticketsGroupedByAssignee).length ? {userIds: Object.keys(ticketsGroupedByAssignee)} : skipToken)

	useEffect(() => {
		if (!isFetching && users){
			setScheduleData(parseTicketDataForScheduler())
		}
	}, [isFetching, users])

	const handleRangeChange = useCallback((range: {startDate: Date, endDate: Date}) => {
		setRange(range)
	}, [])

	const filterData = useCallback((scheduledData: SchedulerData) => {

	}, [range, tickets])

	const parseTicketDataForScheduler = useCallback(() => {
		const schedulerData: SchedulerData = []
		Object.keys(ticketsGroupedByAssignee).forEach((id: string) => {
			const groupedTickets = ticketsGroupedByAssignee[id]
			const firstName = groupedTickets[0]?.assignees?.[0].firstName
			const lastName = groupedTickets[0]?.assignees?.[0].lastName
			const ticketData: Array<SchedulerProjectData> = []
			groupedTickets.forEach((obj: Ticket) => {
				if (obj.dueDate && obj.statusId !== completeStatusId){
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
				}
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
	}, [board, tickets, users])

	return (
		<div className = "tw-relative tw-w-full tw-h-[60vh]">
			<Scheduler 
				data={scheduleData}
				isLoading={isFetching}
				onRangeChange={handleRangeChange}
				onTileClick={(clickedResource) => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("EDIT_TICKET_FORM"))
					dispatch(selectCurrentTicketId(Number(clickedResource.id)))
				}}
				onFilterData={() => {
					setFilterButtonState(1)	
				}}
				onClearFilterData={() => {
					setFilterButtonState(0)	
				}}
				config={{
					zoom: 0,	
					showTooltip: false,
					filterButtonState,
				}}
			/>
		</div>
	)
}