import { Outlet } from "react-router-dom"
import { useGetSprintsQuery } from "../../services/private/sprint"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { BacklogSprintContainer } from "../../components/boards/BacklogSprintContainer"

export const BoardBacklog = () => {
	const { boardInfo } = useAppSelector((state) => state.board)	
	const { data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading} = useGetSprintsQuery(boardInfo ? {urlParams: {
		// get only the most recent sprint
		perPage: 1,
		includeTicketStats: true,
        boardId: boardInfo.id,
		filterInProgress: true,
        recent: true,
    }} : skipToken)

	return (
		<BacklogSprintContainer
			sprint={sprintData?.data?.[0] ?? undefined}
			isSprintLoading={isSprintLoading}
		/>
	)
}
