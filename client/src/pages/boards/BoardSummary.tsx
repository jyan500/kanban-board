import React, { useEffect } from "react"
import { useGetBoardSummaryQuery } from "../../services/private/board"
import { useAppSelector } from "../../hooks/redux-hooks"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { BoardSummary as BoardSummaryType, ProgressBarItem, PieChartItem, UserProfile } from "../../types/common"
import { PRIORITY_COLOR_MAP, TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { HorizontalProgressBarRow } from "../../components/page-elements/HorizontalProgressBarRow"
import { PieChartWithKey } from "../../components/charts/PieChartWithKey" 
import { useLazyGetUserProfilesQuery } from "../../services/private/userProfile" 
import { Avatar } from "../../components/page-elements/Avatar"
import { displayUser, getUserInitials } from "../../helpers/functions"
import { ChartTooltip } from "../../components/charts/ChartTooltip"
import { IconUser } from "../../components/icons/IconUser"
import { IconPencil } from "../../components/icons/IconPencil"
import { IconCircleCheckmark } from "../../components/icons/IconCircleCheckmark"
import { IconCalendar } from "../../components/icons/IconCalendar"
import { IconPaper } from "../../components/icons/IconPaper"
import { BarChart } from "../../components/charts/BarChart"

export const BoardSummary = () => {
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const { statuses } = useAppSelector((state) => state.status)
    const { priorities } = useAppSelector((state) => state.priority)
    const { ticketTypes } = useAppSelector((state) => state.ticketType)

    const { data, isLoading } = useGetBoardSummaryQuery(boardInfo ? {boardId: boardInfo?.id} : skipToken)
    const [trigger, { data: userProfiles, isLoading: isUserProfilesLoading}] = useLazyGetUserProfilesQuery()

    useEffect(() => {
        // get all user profiles from the tickets to assignees
        if (data && !isLoading){
            const userIds = data.ticketsByAssignee.map((obj) => obj.userId)
            trigger({userIds: userIds})
        }
    }, [data, isLoading])
    
    const totalTickets = data?.totalTickets ?? 0
    const completedTickets = data?.ticketsByStatus
        .filter(item => item.statusId === 4)
        .reduce((sum, item) => sum + item.totalTickets, 0) ?? 0

    const statusData: Array<PieChartItem> = data?.ticketsByStatus.map(item => {
        const status = statuses.find((status) => status.id === item.statusId)
        return {
            id: item.statusId,
            name: status ? status.name : `Status ${item.statusId}`,
            value: item.totalTickets,
            color: "#78909C" // Dark Gray
        }
    }) ?? []

    const priorityData: Array<PieChartItem> = data?.ticketsByPriority.map(item => {
        const priority = priorities.find((priority) => priority.id === item.priorityId)
        return {
            id: item.priorityId,
            name: priority ? priority.name : `Priority ${item.priorityId}`,
            value: item.totalTickets,
            color: priority ? PRIORITY_COLOR_MAP[priority.name] : '#999'
        }
    }) ?? []

    const typeData: Array<PieChartItem> = data?.ticketsByTicketType.map(item => {
        const ticketType = ticketTypes.find((ticketType) => ticketType.id === item.ticketTypeId)
        return {
            id: item.ticketTypeId,
            name: ticketType ? ticketType.name : `Type ${item.ticketTypeId}`,
            value: item.totalTickets,
            color: ticketType ? TICKET_TYPE_COLOR_MAP[ticketType.name] : '#999'
        }
    }) ?? []

    const assigneeData: Array<ProgressBarItem> = data?.ticketsByAssignee.map(item => {
        let profile: UserProfile | undefined; 
        if (userProfiles){
            profile = userProfiles.data.find((userProfile: UserProfile) => userProfile.id === item.userId)
        }
        const percentage = totalTickets > 0 ? Math.round((item.totalTickets / totalTickets) * 100) : 0
        return {
            name: !item.userId ? 'Unassigned' : displayUser(profile),
            value: item.totalTickets,
            initials: getUserInitials(profile),
            imageUrl: profile?.imageUrl,
            percentage: percentage,
            hoverText: `${percentage}% (${item.totalTickets}/${totalTickets} tickets)`,
        }
    }) ?? []

    return (
        isLoading && !data ? 
        <LoadingSkeleton>
            <RowPlaceholder/>
        </LoadingSkeleton> :
        <div className="tw-min-h-screen tw-bg-gray-50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto tw-space-y-6">
                {/* Top Stats Cards */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <IconCircleCheckmark className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{completedTickets} completed</div>
                                <div className="tw-text-sm tw-text-gray-500">in the last 7 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <IconPencil className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data?.ticketsUpdated.totalTickets ?? 0} updated</div>
                                <div className="tw-text-sm tw-text-gray-500">in the last 7 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <IconPaper className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data?.ticketsCreated.totalTickets ?? 0} created</div>
                                <div className="tw-text-sm tw-text-gray-500">in the last 7 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <IconCalendar className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data?.ticketsDue.totalTickets ?? 0} due soon</div>
                                <div className="tw-text-sm tw-text-gray-500">in the next 7 days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4">
                    {/* Status Overview */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Status overview</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a snapshot of the status of your work items.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">View all work items</a>
                        </p>
                        <div className = "tw-space-y-1">
                            <BarChart data={statusData} searchKey={"statusId"} boardId={boardInfo?.id ?? 0}/>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Priority breakdown</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a holistic view of how work is being prioritized.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">How to manage priorities for spaces</a>
                        </p>
                        <div className="tw-flex tw-items-center tw-justify-center tw-mb-6">
                            <PieChartWithKey boardId={boardInfo?.id ?? 0} searchKey={"priorityId"} data={priorityData} total={totalTickets}/>
                        </div>
                    </div>

                    {/* Team Workload */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Team workload</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Monitor the capacity of your team.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">Reassign tickets to get the right balance</a>
                        </p>

                        <div className="tw-space-y-3">
                            {assigneeData.map((item, index) => {
                                return (
                                    <div key={index} className = "tw-space-y-1">
                                        <HorizontalProgressBarRow
                                            icon={item.name !== "Unassigned" ? <Avatar userInitials={item.initials} imageUrl={item.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/> : <IconUser className = "tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6"/>}
                                            item={item}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Types of Work */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Types of tickets</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a breakdown of tickets by their types.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">View all tickets</a>
                        </p>

                        <div className="tw-flex tw-items-center tw-justify-center tw-mb-6">
                            <PieChartWithKey
                                searchKey={"ticketTypeId"}
                                boardId={boardInfo?.id ?? 0}
                                data={typeData}
                                total={totalTickets}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
