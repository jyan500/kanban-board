import React, {useState, useEffect} from "react"
import { useGetTicketsQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { BulkEditFormValues, BulkEditOperation, BulkEditOperationKey } from "./BulkActionsForm"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { LoadingSpinner } from "../LoadingSpinner"

interface Props {
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	step: number
	setStep: (step: number) => void
	formValues: BulkEditFormValues
	operation: BulkEditOperationKey | null | undefined
	operations: Array<BulkEditOperation>
	onSubmit: () => void
}

export const BulkActionsFormStep4 = ({selectedIds, step, setStep, formValues, setSelectedIds, operation, operations, onSubmit}: Props) => {
	const [page, setPage] = useState(1)
	const { data, isLoading, isFetching, isError } = useGetTicketsQuery({
		page: page,
		ticketIds: selectedIds,
		sortBy: "createdAt",
		order: "desc",
		includeAssignees: true,
	})
	const config = useBoardTicketConfig(false, selectedIds, setSelectedIds)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">Step 4 of 4: Confirmation</h3>
			<p>Please confirm the operation and tickets selected, and click "Confirm" to commit these changes.</p>
			<p><span className = "tw-font-semibold">Operation: </span> {operations.find(op => op.key === operation)?.text}</p>
			{data?.pagination.nextPage || data?.pagination.prevPage ? (
					<PaginationRow
						showNumResults={true}
						showPageNums={false}
						setPage={setPage}	
						paginationData={data?.pagination}
						currentPage={page}
					/>
				) : null
			}
			<div className = "tw-h-96 tw-overflow-y-auto">
				{
					!isLoading && data?.data ? (
						<>
							
								<Table 
									data={data?.data} 
									config={config} 
									tableKey={"bulk-actions-confirmation"}
								></Table>
						</>
					) : null
				}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button onClick={onSubmit} className = "button">Confirm</button>
				<button onClick={() => {
					setStep(step-1)
				}} className = "button --secondary">Cancel</button>
			</div>
		</div>

	)
}