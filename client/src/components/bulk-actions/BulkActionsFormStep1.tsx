import React, {useState, useEffect} from "react"
import { useGetTicketsQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { BOARD_TICKET_URL } from "../../helpers/urls"
import { BulkEditToolbar } from "../page-elements/BulkEditToolbar"
import { useForm, FormProvider } from "react-hook-form"
import { Ticket } from "../../types/common"
import { LoadingButton } from "../page-elements/LoadingButton"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { Filters } from "./Filters"
import { RowContentLoading } from "../page-elements/RowContentLoading"
import { TicketTable } from "../tickets/TicketTable"

interface Props {
	boardId: number | null | undefined
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	step: number
	setStep: (step: number) => void
	closeModal: () => void
}

type Filters = {
	ticketType: string
	priority: string
	status: string
}

export type FormValues = Filters & {
	searchBy: string
	query: string	
}

export const BulkActionsFormStep1 = ({boardId, step, setStep, selectedIds, setSelectedIds, closeModal}: Props) => {
	return (
		<TicketTable
			boardId={boardId}
			header={"Step 1 of 4: Choose Tickets"}
			selectedIds={selectedIds}
			setSelectedIds={setSelectedIds}
			tableClassName={"tw-h-96 tw-overflow-y-auto"}
			key={"bulk-actions"}
			stepButtonRow={
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
 					<button disabled={selectedIds.length === 0} onClick={() => setStep(step+1)} className = "button">Next</button>	
 					<button onClick={closeModal} className = "button --secondary">Cancel</button>	
 				</div>
			}
		/>
	)
}
