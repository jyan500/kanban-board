import React, { useEffect, useLayoutEffect, useState } from "react"
import { useGetBoardActivityQuery, useGetBoardSummaryQuery, useGetByAssigneeSummaryQuery } from "../../services/private/board"
import { useAppSelector } from "../../hooks/redux-hooks"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useNavigate, Link } from "react-router-dom"
import { BoardSummary as BoardSummaryType, ByAssigneeSummary, TicketEntityHistory, ProgressBarItem, PieChartItem, UserProfile, Ticket } from "../../types/common"
import { 
    PRIMARY_TEXT, 
    SECONDARY_TEXT, 
    STANDARD_BORDER, 
    NESTED_TABLE_BACKGROUND, 
    PIE_CHART_COLOR_MAP, 
    TABLE_BACKGROUND, 
    TICKET_TYPE_COLOR_MAP, 
    STANDARD_HOVER,
    STANDARD_DROPDOWN_ITEM,
    TERTIARY_TEXT,
    FADE_ANIMATION,
} from "../../helpers/constants"
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
import { SummaryCard } from "../../components/charts/SummaryCard"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { format } from "date-fns"
import { MdBreakfastDining } from "react-icons/md"
import { BOARD_ACTIVITY_URL } from "../../helpers/urls"
import { useScreenSize } from "../../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../../helpers/constants"
import { IconHelp } from "../../components/icons/IconHelp"
import { HoverTooltip } from "../../components/page-elements/HoverTooltip"


type GroupedActivity = TicketEntityHistory & {
    changedByUser: string
}

export const BoardSummary = () => {
    const navigate = useNavigate()
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const { statuses } = useAppSelector((state) => state.status)
    const { priorities } = useAppSelector((state) => state.priority)
    const { ticketTypes } = useAppSelector((state) => state.ticketType)
    const [ groupedRecentActivity, setGroupedRecentActivity ] = useState<Record<string, Array<GroupedActivity>>>({})
    const [ historyPage, setHistoryPage ] = useState(1)
    const [ assigneePage, setAssigneePage ] = useState(1)
    const { width, height } = useScreenSize()

    const { data, isLoading } = useGetBoardSummaryQuery(boardInfo ? {boardId: boardInfo?.id, urlParams: {}} : skipToken)
    const { data: boardActivityData, isLoading: isBoardActivityLoading} = useGetBoardActivityQuery(boardInfo ? {boardId: boardInfo?.id, urlParams: {perPage: 20, page: historyPage}} : skipToken)
    const { data: byAssigneeSummary, isLoading: isByAssigneeSummaryLoading } = useGetByAssigneeSummaryQuery(boardInfo ? {boardId: boardInfo?.id, urlParams: {perPage: 8, page: assigneePage}} : skipToken)
    const [trigger, { data: userProfiles, isLoading: isUserProfilesLoading}] = useLazyGetUserProfilesQuery()

    useEffect(() => {
        // get all user profiles from the tickets to assignees
        if (byAssigneeSummary && boardActivityData && !isByAssigneeSummaryLoading && !isBoardActivityLoading){
            const userIds = byAssigneeSummary.data?.map((obj) => obj.userId)
            // make sure the id is not in userIds to avoid duplicates
            const boardActivityUserIds = boardActivityData.data.map((obj) => obj.changedBy).filter((id) => !userIds.includes(id))
            const allUserIds = [...userIds, ...boardActivityUserIds]
            if (userIds.length){
                trigger({userIds: allUserIds, skipPaginate: true}, true)
            }
        }
    }, [byAssigneeSummary, boardActivityData, isByAssigneeSummaryLoading, isBoardActivityLoading])

    useEffect(() => {
        if (!isBoardActivityLoading && boardActivityData && userProfiles && !isUserProfilesLoading){
            const groupedActivity = boardActivityData.data.reduce((acc: Record<string, Array<GroupedActivity>>, obj: TicketEntityHistory ) => {
                const changedAt = format(new Date(obj.changedAt), "MMMM dd, yyyy")
                if (!(changedAt in acc)){
                    acc[changedAt] = []
                }
                acc[changedAt].push({
                    ...obj,
                    changedByUser: displayUser(userProfiles.data.find((userProfile) => userProfile.id === obj.changedBy)),
                })
                return acc
            }, {})
            setGroupedRecentActivity(groupedActivity)
        }
    }, [isBoardActivityLoading, boardActivityData, userProfiles, isUserProfilesLoading])
    
    const totalTickets = data?.totalTickets ?? 0

    const statusData: Array<PieChartItem> = data?.ticketsByStatus.map(item => {
        const status = statuses.find((status) => status.id === item.statusId)
        return {
            id: item.statusId,
            name: status ? status.name : `Status ${item.statusId}`,
            value: Number(item.totalTickets),
            color: "#78909C" // Dark Gray
        }
    }) ?? []

    const priorityData: Array<PieChartItem> = data?.ticketsByPriority.map((item, index) => {
        const priority = priorities.find((priority) => priority.id === item.priorityId)
        return {
            id: item.priorityId,
            name: priority ? priority.name : `Priority ${item.priorityId}`,
            value: Number(item.totalTickets),
            color: priority ? PIE_CHART_COLOR_MAP[priority.name] : '#999'
        }
    }) ?? []

    const typeData: Array<PieChartItem> = data?.ticketsByTicketType.map(item => {
        const ticketType = ticketTypes.find((ticketType) => ticketType.id === item.ticketTypeId)
        return {
            id: item.ticketTypeId,
            name: ticketType ? ticketType.name : `Type ${item.ticketTypeId}`,
            value: Number(item.totalTickets),
            color: ticketType ? TICKET_TYPE_COLOR_MAP[ticketType.name] : '#999'
        }
    }) ?? []

    const assigneeData: Array<ProgressBarItem> = byAssigneeSummary?.data.map(item => {
        let profile: UserProfile | undefined; 
        if (userProfiles){
            profile = userProfiles.data.find((userProfile: UserProfile) => userProfile.id === item.userId)
        }
        const percentage = totalTickets > 0 ? Math.round((item.totalTickets / totalTickets) * 100) : 0
        return {
            id: item.userId,
            name: !item.userId ? 'Unassigned' : displayUser(profile),
            value: Number(item.totalTickets),
            initials: getUserInitials(profile),
            imageUrl: profile?.imageUrl,
            percentage: percentage,
            hoverText: `${percentage}% (${item.totalTickets}/${totalTickets} tickets)`,
        }
    }) ?? []

    const encodeIds = (ids: Array<number>) => {
        const params = new URLSearchParams();
        params.append('ticketIds', ids.join(','));
        return params.toString();
    }

    const constructTicketLink = (ids: Array<number>) => {
        return `${TICKETS}?${encodeIds(ids ?? [])}`
    }



    return (
        isLoading && !data ? 
        <LoadingSkeleton>
            <RowPlaceholder/>
        </LoadingSkeleton> :
        <div className={`${TABLE_BACKGROUND} tw-flex-col tw-flex 2xl:tw-flex-row 2xl:tw-gap-x-4 tw-gap-y-4 tw-p-6`}>
            <div className="tw-flex-[3] tw-min-h-0 tw-flex tw-flex-col tw-gap-y-6">
                {/* Top Stats Cards */}
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 2xl:tw-grid-cols-4 tw-gap-4">
                    <SummaryCard 
                        icon={<IconCircleCheckmark className = {`tw-w-5 tw-h-5 tw-text-gray-700`}/>}
                        link={constructTicketLink(data?.ticketsCompleted ?? [])}
                        header={`${data?.ticketsCompleted.length ?? 0} completed`}
                        subHeader={"in the last 7 days"}
                    >
                    </SummaryCard>
                    <SummaryCard
                        icon={<IconPencil className = "tw-w-5 tw-h-5 tw-text-gray-700"/>}
                        link={constructTicketLink(data?.ticketsUpdated ?? [])}
                        header={`${data?.ticketsUpdated.length ?? 0} updated`}
                        subHeader={"in the last 7 days"}
                    >
                    </SummaryCard>
                    <SummaryCard
                        icon={<IconPaper className = "tw-w-5 tw-h-5 tw-text-gray-700"/>}
                        link={constructTicketLink(data?.ticketsCreated ?? [])}
                        header={`${data?.ticketsCreated.length ?? 0} created`}
                        subHeader={"in the last 7 days"}
                    />
                    <SummaryCard
                        icon={<IconCalendar className = "tw-w-5 tw-h-5 tw-text-gray-700"/>}
                        link={constructTicketLink(data?.ticketsDue ?? [])}
                        header={`${data?.ticketsDue.length ?? 0} due soon`}
                        subHeader={"in the next 7 days"}
                    />
                </div>

                {/* Main Content Grid, 2nd row stretches to fill the remaining height */}
                <div className="tw-flex-1 tw-min-h-0 tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 lg:tw-grid-rows-[auto_1fr]">
                    {/* Status Overview */}
                    <div className={`${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
                        <h2 className={`${PRIMARY_TEXT} tw-text-lg tw-font-semibold tw-mb-2`}>Status overview</h2>
                        <p className={`tw-text-sm ${SECONDARY_TEXT} tw-mb-6`}>
                            Get a snapshot of the status of your tickets.{' '}
                            <Link to={`${TICKETS}?boardId=${boardInfo?.id ?? 0}`} className={`${TERTIARY_TEXT} hover:tw-underline`}>View all tickets</Link>
                        </p>
                        <div className = "tw-space-y-1">
                            <BarChart data={statusData} searchKey={"statusId"} boardId={boardInfo?.id ?? 0}/>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className={`${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
                        <h2 className={`${PRIMARY_TEXT} tw-text-lg tw-font-semibold tw-mb-2`}>Priority breakdown</h2>
                        <p className={`tw-text-sm ${SECONDARY_TEXT} tw-mb-6`}>
                            Get a holistic view of how tickets are being prioritized.{' '}
                            <Link to={`${TICKETS}?boardId=${boardInfo?.id ?? 0}`} className={`${TERTIARY_TEXT} hover:tw-underline`}>Manage priorities</Link>
                        </p>
                        <div className="tw-flex tw-items-center tw-justify-center tw-mb-6">
                            <PieChartWithKey boardId={boardInfo?.id ?? 0} searchKey={"priorityId"} data={priorityData} total={totalTickets}/>
                        </div>
                    </div>

                    {/* Team Workload */}
                    <div className={`tw-relative ${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
                        <h2 className={`${PRIMARY_TEXT} tw-text-lg tw-font-semibold tw-mb-2`}>Team workload</h2>
                        <p className={`tw-text-sm ${SECONDARY_TEXT} tw-mb-6`}>
                            Monitor the capacity of your team.{' '}
                            <Link to={`${TICKETS}?boardId=${boardInfo?.id ?? 0}`} className={`${TERTIARY_TEXT} hover:tw-underline`}>Reassign tickets</Link>
                        </p>

                        {/* extra margin bottom to prevent overlap with the pagination */}
                        <div className="tw-mb-10 tw-space-y-3">
                            <div className={`tw-space-y-3 ${byAssigneeSummary?.pagination.prevPage || byAssigneeSummary?.pagination.nextPage ? "tw-h-[550px] tw-overflow-y-auto" : ""}`}>
                                {assigneeData.map((item, index) => {
                                    return (
                                        <div key={index} className = "tw-space-y-1">
                                            <HorizontalProgressBarRow
                                                icon={item.name !== "Unassigned" ? <Avatar userInitials={item.initials} imageUrl={item.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/> : <IconUser className = {`${PRIMARY_TEXT} tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6`}/>}
                                                item={item}
                                                link={`${TICKETS}?boardId=${boardInfo?.id ?? 0}&assignedToUser=${item.id ?? "0"}`}
                                                showPercentages={false}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            
                        </div>
                        {
                            !isByAssigneeSummaryLoading && byAssigneeSummary?.pagination && (byAssigneeSummary?.pagination.prevPage || byAssigneeSummary?.pagination.nextPage) ? 
                                <div className="tw-absolute tw-bottom-4 tw-left-3" >
                                    <PaginationRow setPage={setAssigneePage} currentPage={assigneePage} showPageNums={true} paginationData={byAssigneeSummary?.pagination}/>
                                </div>
                            : null 
                        }
                    </div>

                    {/* Ticket Types */}
                    <div className={`${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
                        <h2 className={`${PRIMARY_TEXT} tw-text-lg tw-font-semibold tw-mb-2`}>Types of tickets</h2>
                        <p className={`tw-text-sm ${SECONDARY_TEXT} tw-mb-6`}>
                            Get a breakdown of tickets by their types.{' '}
                            <Link to={`${TICKETS}?boardId=${boardInfo?.id ?? 0}`} className={`${TERTIARY_TEXT} hover:tw-underline`}>View all tickets</Link>
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
            <div className = {`tw-relative tw-min-w-0 tw-flex-1 tw-flex tw-flex-col tw-gap-y-4 ${NESTED_TABLE_BACKGROUND} tw-rounded-lg ${STANDARD_BORDER} tw-p-6`}>
                <div>
                    <div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                        <h2 className={`${PRIMARY_TEXT} tw-text-lg tw-font-semibold tw-mb-2`}>Recent Activity</h2>
                        <div className="tw-group tw-relative">
                            <IconHelp className = {`${SECONDARY_TEXT} tw-w-5 tw-h-5`}/>
                            <HoverTooltip direction={"top"} width={"tw-w-32 lg:tw-w-48"} text={"Currently shows recent activity up to the last 7 days"}/>
                        </div>
                    </div>
                    <p className={`${SECONDARY_TEXT} tw-text-sm tw-text-gray-600 tw-mb-6`}>
                        Stay up to date with what's happening across the space
                    </p>
                </div>
                {
                    (isBoardActivityLoading ) ?     
                    <LoadingSkeleton>
                        <RowPlaceholder/>
                    </LoadingSkeleton>
                    : 
                    (Object.keys(groupedRecentActivity).length ? (
                        <div className={`${boardActivityData?.pagination.prevPage || boardActivityData?.pagination.nextPage ? "tw-h-[1050px] tw-overflow-y-auto" : ""} tw-mb-10 tw-flex tw-flex-col tw-gap-y-4`}>
                            {
                                Object.keys(groupedRecentActivity).map((date, index) => {
                                    return (
                                        <div key={`recent-activity-group-${index}`} className = {`${NESTED_TABLE_BACKGROUND} tw-flex tw-flex-col tw-gap-y-4`}>
                                            <p className = {`tw-text-sm ${SECONDARY_TEXT}`}>{date}</p>
                                            {
                                                groupedRecentActivity[date].map((history) => {
                                                    const displayName = displayUser(userProfiles?.data.find((user) => user.id === history.changedBy))
                                                    const user = userProfiles?.data?.find((user) => user.id === history.changedBy) ?? null
                                                    return (
                                                        <div className = "tw-flex tw-flex-row tw-gap-x-4 tw-items-center" key = {`recent-activity-${history.historyId}`}>
                                                            <Avatar userInitials={getUserInitials(user)} imageUrl={user?.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/>
                                                            <Link to={`${TICKETS}/${history.ticketId}`} className = {`hover:tw-opacity-60 ${FADE_ANIMATION} ${PRIMARY_TEXT} tw-line-clamp-2`}>{history.displayString}</Link>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ) : (
                        <p className={SECONDARY_TEXT}>No Recent Activity Found</p>
                    ))
                }
                {
                    !isBoardActivityLoading && boardActivityData?.pagination && Object.keys(groupedRecentActivity).length && (boardActivityData?.pagination.prevPage || boardActivityData?.pagination.nextPage) ? 
                        <div className = "tw-absolute tw-bottom-4 tw-left-3">
                            <PaginationRow setPage={setHistoryPage} currentPage={historyPage} showPageNums={true} paginationData={boardActivityData?.pagination}/>
                        </div>
                    : null 
                }
            </div>
        </div>
    )
}
