import React from "react"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { skipToken } from '@reduxjs/toolkit/query/react'

interface Props {
	boardId: number | null | undefined
}

export const BulkActionsFormStep1 = ({boardId}: Props) => {
	const { data, isLoading, isError } = useGetBoardTicketsQuery(boardId ? {id: boardId, urlParams: {}} : skipToken)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 1 of 4: Choose Tickets</h3>		
			<p>Please choose the tickets that you would like to perform actions on</p>
		</div>
	)
}