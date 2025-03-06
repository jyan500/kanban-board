import React, {useState} from "react"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { BOARD_TICKET_URL } from "../../helpers/urls"

interface Props {
	boardId: number | null | undefined
}

type Filters = {
	ticketType: string
	priority: string
	status: string
}

export const BulkActionsFormStep1 = ({boardId}: Props) => {
	const [ page, setPage ] = useState(1)
	const { data, isLoading, isError } = useGetBoardTicketsQuery(boardId ? {
		id: boardId, 
		urlParams: {
			page: page,
			includeAssignees: true,
		}
	} : skipToken)
	const config = useBoardTicketConfig(true)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 1 of 4: Choose Tickets</h3>		
			<p>Please choose the tickets that you would like to perform actions on</p>
			{
				!isLoading && data?.data && boardId ? (
					<>
						<Table data={data?.data} config={config}></Table>
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setPage}	
							paginationData={data?.pagination}
							currentPage={page}
							url={BOARD_TICKET_URL(boardId, "")}	
						/>
					</>
				) : null
			}
			
		</div>
	)
}