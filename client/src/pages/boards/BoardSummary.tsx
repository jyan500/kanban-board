import React from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FiCheckCircle, FiEdit, FiFileText, FiCalendar } from 'react-icons/fi'
import { useGetBoardSummaryQuery } from "../../services/private/board"
import { useAppSelector } from "../../hooks/redux-hooks"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { BoardSummary as BoardSummaryType } from "../../types/common"
import { PRIORITY_COLOR_MAP, TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"

// Mock data - replace with actual data from API
const mockData: BoardSummaryType = {
    ticketsByAssignee: [
        {userId: 0, totalTickets: 24}, // Unassigned
        {userId: 1, totalTickets: 1}  // Jansen Yan
    ],
    ticketsByPriority: [
        {priorityId: 4, totalTickets: 10}, // Medium
        {priorityId: 3, totalTickets: 10}, // Medium
        {priorityId: 2, totalTickets: 4} // Medium
    ],
    ticketsByStatus: [
        {statusId: 1, totalTickets: 24}, // To Do
        {statusId: 2, totalTickets: 1}   // In Progress
    ],
    ticketsByTicketType: [
        {ticketTypeId: 1, totalTickets: 25} // Task
    ],
    ticketsDue: {totalTickets: 0},
    ticketsCreated: {totalTickets: 0},
    ticketsUpdated: {totalTickets: 2}
}

const STATUS_COLORS: Record<number, string> = {
    1: '#4CAF50', // To Do - Green
    2: '#2196F3', // In Progress - Blue
    3: '#FF9800', // Review - Orange
    4: '#9E9E9E'  // Done - Gray
}

const PRIORITY_COLORS: Record<number, string> = {
    1: '#78909C', // Low
    2: '#78909C', // Medium
    3: '#78909C', // High
}

const STATUS_LABELS: Record<number, string> = {
    1: 'To Do',
    2: 'In Progress',
    3: 'Review',
    4: 'Done'
}

const PRIORITY_LABELS: Record<number, string> = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
}

const TYPE_LABELS: Record<number, {label: string, icon: string}> = {
    1: {label: 'Task', icon: '☑'},
    2: {label: 'Epic', icon: '⚡'},
    3: {label: 'Bug', icon: '🐛'},
    4: {label: 'Story', icon: '📄'},
    5: {label: 'Subtask', icon: '🔗'}
}

export const BoardSummary = () => {
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
    const { statuses } = useAppSelector((state) => state.status)
    const { priorities } = useAppSelector((state) => state.priority)

    const { data: boardSummaryData, isLoading } = useGetBoardSummaryQuery(boardInfo ? {boardId: boardInfo?.id} : skipToken)
    const data = mockData
    
    // Calculate totals
    const totalTickets = data.ticketsByStatus.reduce((sum, item) => sum + item.totalTickets, 0)
    const completedTickets = data.ticketsByStatus
        .filter(item => item.statusId === 4)
        .reduce((sum, item) => sum + item.totalTickets, 0)

    // Prepare chart data
    const statusData = data.ticketsByStatus.map(item => ({
        name: STATUS_LABELS[item.statusId] || `Status ${item.statusId}`,
        value: item.totalTickets,
        color: STATUS_COLORS[item.statusId] || '#999'
    }))

    const priorityData = data.ticketsByPriority.map(item => ({
        name: PRIORITY_LABELS[item.priorityId] || `Priority ${item.priorityId}`,
        value: item.totalTickets
    }))

    const typeData = data.ticketsByTicketType.map(item => ({
        name: TYPE_LABELS[item.ticketTypeId]?.label || `Type ${item.ticketTypeId}`,
        value: item.totalTickets,
        percentage: totalTickets > 0 ? Math.round((item.totalTickets / totalTickets) * 100) : 0
    }))

    const assigneeData = data.ticketsByAssignee.map(item => ({
        name: item.userId === 0 ? 'Unassigned' : `User ${item.userId}`,
        value: item.totalTickets,
        percentage: totalTickets > 0 ? Math.round((item.totalTickets / totalTickets) * 100) : 0
    }))

    return (
        <div className="tw-min-h-screen tw-bg-gray-50 tw-p-6">
            <div className="tw-max-w-7xl tw-mx-auto tw-space-y-6">
                {/* Top Stats Cards */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <FiCheckCircle className="tw-w-5 tw-h-5 tw-text-gray-600" />
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
                                <FiEdit className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data.ticketsUpdated.totalTickets} updated</div>
                                <div className="tw-text-sm tw-text-gray-500">in the last 7 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <FiFileText className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data.ticketsCreated.totalTickets} created</div>
                                <div className="tw-text-sm tw-text-gray-500">in the last 7 days</div>
                            </div>
                        </div>
                    </div>

                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <div className="tw-flex tw-items-start tw-gap-3">
                            <div className="tw-p-2 tw-bg-gray-100 tw-rounded">
                                <FiCalendar className="tw-w-5 tw-h-5 tw-text-gray-600" />
                            </div>
                            <div>
                                <div className="tw-text-2xl tw-font-semibold">{data.ticketsDue.totalTickets} due soon</div>
                                <div className="tw-text-sm tw-text-gray-500">in the next 7 days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                    {/* Status Overview */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Status overview</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a snapshot of the status of your work items.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">View all work items</a>
                        </p>
                        
                        <div className="tw-flex tw-items-center tw-justify-center tw-mb-6">
                            <div className="tw-relative">
                                <ResponsiveContainer width={250} height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-center">
                                    <div className="tw-text-4xl tw-font-bold">{totalTickets}</div>
                                    <div className="tw-text-sm tw-text-gray-600">Total work item...</div>
                                </div>
                            </div>
                        </div>

                        <div className="tw-space-y-2">
                            {statusData.map((item, index) => (
                                <div key={index} className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                    <div 
                                        className="tw-w-3 tw-h-3 tw-rounded-sm" 
                                        style={{backgroundColor: item.color}}
                                    />
                                    <span className="tw-text-gray-700">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Priority breakdown</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a holistic view of how work is being prioritized.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">How to manage priorities for spaces</a>
                        </p>
                        
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={priorityData}>
                                <XAxis 
                                    dataKey="name" 
                                    tick={{fontSize: 12}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{fontSize: 12}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip />
                                <Bar dataKey="value" fill="#78909C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Team Workload */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Team workload</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Monitor the capacity of your team.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">Reassign work items to get the right balance</a>
                        </p>

                        <div className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                                <span>Assignee</span>
                                <span>Work distribution</span>
                            </div>
                            {assigneeData.map((item, index) => (
                                <div key={index} className="tw-space-y-1">
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        {item.name === 'Unassigned' ? (
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1">
                                                <div className="tw-w-6 tw-h-6 tw-bg-gray-200 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                                                    <span className="tw-text-xs tw-text-gray-600">👤</span>
                                                </div>
                                                <span className="tw-text-sm">{item.name}</span>
                                            </div>
                                        ) : (
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1">
                                                <div className="tw-w-6 tw-h-6 tw-bg-teal-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                                                    <span className="tw-text-xs tw-text-white">JY</span>
                                                </div>
                                                <span className="tw-text-sm">Jansen Yan</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tw-ml-8">
                                        <div className="tw-w-full tw-bg-gray-200 tw-rounded tw-h-6">
                                            <div 
                                                className="tw-bg-gray-400 tw-h-6 tw-rounded tw-flex tw-items-center tw-justify-end tw-pr-2"
                                                style={{width: `${item.percentage}%`}}
                                            >
                                                <span className="tw-text-xs tw-font-medium tw-text-gray-700">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Types of Work */}
                    <div className="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-6">
                        <h2 className="tw-text-lg tw-font-semibold tw-mb-2">Types of work</h2>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
                            Get a breakdown of work items by their types.{' '}
                            <a href="#" className="tw-text-blue-600 hover:tw-underline">View all items</a>
                        </p>

                        <div className="tw-space-y-3">
                            <div className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                                <span>Type</span>
                                <span>Distribution</span>
                            </div>
                            {typeData.map((item, index) => (
                                <div key={index} className="tw-space-y-1">
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-sm">{TYPE_LABELS[index + 1]?.icon || '📋'}</span>
                                        <span className="tw-text-sm">{item.name}</span>
                                    </div>
                                    <div className="tw-ml-6">
                                        <div className="tw-w-full tw-bg-gray-200 tw-rounded tw-h-6">
                                            <div 
                                                className="tw-bg-gray-400 tw-h-6 tw-rounded tw-flex tw-items-center tw-justify-end tw-pr-2"
                                                style={{width: `${item.percentage}%`}}
                                            >
                                                <span className="tw-text-xs tw-font-medium tw-text-gray-700">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
