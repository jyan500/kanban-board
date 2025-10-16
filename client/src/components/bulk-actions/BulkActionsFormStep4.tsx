import React, {useState, useEffect} from "react"
import { useGetTicketsQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { BulkEditFormValues, BulkEditOperation, BulkEditOperationKey } from "./BulkActionsForm"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { LoadingSpinner } from "../LoadingSpinner"
import { IconWarning } from "../icons/IconWarning"
import { RowContentLoading } from "../page-elements/RowContentLoading"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Button } from "../page-elements/Button"

interface Props {
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	step: number
	setStep: (step: number) => void
	formValues: BulkEditFormValues
	operation: BulkEditOperationKey | null | undefined
	operations: Array<BulkEditOperation>
	onSubmit: () => void
	isSubmitLoading: boolean
	skipStep3: boolean
}

export const BulkActionsFormStep4 = ({isSubmitLoading, selectedIds, skipStep3, step, setStep, formValues, setSelectedIds, operation, operations, onSubmit}: Props) => {
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
			{operation === "remove-issues" ? (
				<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
					<IconWarning className = "tw-w-8 tw-h-8"/>
					<div>
						<strong>You're about to remove the selected issues from the board.</strong>
						<p>Note this does not <span>permanently</span> delete the ticket.</p>
					</div>
				</div>
			) : null}
			<div></div>
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
					) : <RowContentLoading/>
				}
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton isLoading={isSubmitLoading} onClick={onSubmit} text={"Confirm"}/>
				<Button theme="secondary" onClick={() => {
					if (step-1 === 3 && skipStep3){
						setStep(step-2)
					}
					else {
						setStep(step-1)
					}
				}} >Cancel</Button>
			</div>
		</div>

	)
}
