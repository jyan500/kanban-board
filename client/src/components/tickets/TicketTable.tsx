import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { ticketApi, useGetTicketsQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { BOARD_TICKET_URL } from "../../helpers/urls"
import { BulkEditToolbar } from "../page-elements/BulkEditToolbar"
import { useForm, FormProvider } from "react-hook-form"
import { Ticket } from "../../types/common"
import { LoadingButton } from "../page-elements/LoadingButton"
import { SearchToolBar } from "./SearchToolBar"
import { Filters } from "../bulk-actions/Filters"
import { RowContentLoading } from "../page-elements/RowContentLoading"
import { BoardFilters, setFilterButtonState, setFilters } from "../../slices/boardFilterSlice"
import { Button} from "../page-elements/Button"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { IconFilter } from "../icons/IconFilter"

interface Props {
	boardId: number | null | undefined
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	key: string
	header: string
	stepButtonRow?: React.ReactNode
	tableClassName?: string
	bulkEditAction?: (ids: Array<number>) => void	
}

export type FormValues = {
	searchBy: string
	query: string	
}

export const TicketTable = ({
	tableClassName, 
	key, 
	header, 
	boardId, 
	selectedIds, 
	setSelectedIds, 
	stepButtonRow, 
	bulkEditAction,
}: Props) => {
	const [ page, setPage ] = useState(1)

	const { filters, filterButtonState } = useAppSelector((state) => state.boardFilter)

	const defaultForm: FormValues = {
		query: "",
		searchBy: "title",
	}

	const dispatch = useAppDispatch()

	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods

	const registerOptions = {
	}

	const { data, isLoading, isFetching, isError } = useGetTicketsQuery(boardId !== 0 ? {
		...(Object.keys(filters).reduce((acc: Record<string, any>, key) => {
			const typedKey = key as keyof BoardFilters
			if (filters[typedKey] == null){
				acc[typedKey] = "" 
			}
			else {
				acc[typedKey] = filters[typedKey]
			}
			return acc	
		}, {} as Record<string, any>)),
		page: page,
		board: boardId,
		sortBy: "createdAt",
		order: "desc",
		includeAssignees: true,
		// only include the filters that aren't null
		...preloadedValues,	
	} : skipToken)

	const selectCurrentPageIds = () => {
		const nonSelectedIdsOnCurrentPage = data?.data.map((ticket) => ticket.id).filter((id) => !selectedIds.includes(id))
		// concatenate the remainder of the ids on the current page that haven't been selected yet
		if (nonSelectedIdsOnCurrentPage){
			setSelectedIds([...selectedIds, ...nonSelectedIdsOnCurrentPage])
		}
	}

	const unselectCurrentPageIds = () => {
		// all the selected ids on the current page
		const ids = data?.data.map((ticket) => ticket.id)
		// exclude all the ids on the current page
		if (ids){
			const withoutCurrentPageIds = selectedIds.filter((id) => !ids.includes(id))
			setSelectedIds(withoutCurrentPageIds)
		}
	}

	const onSubmit = (values: FormValues) => {
		setPage(1)
		setPreloadedValues(values)
	}

	// if the bulkEditAction is defined, that means we're coming from the board table instead of the bulk actions form
	const config = useBoardTicketConfig(true, selectedIds, setSelectedIds, bulkEditAction != undefined)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<h3 className = "tw-m-0">{header}</h3>	
			<FormProvider {...methods}>
				<SearchToolBar 
					paginationData={data?.pagination} 
					setPage={setPage} 
					currentPage={page ?? 1}
					registerOptions={registerOptions}
					searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					hidePagination={true}
					additionalButtons={() => {
						return (
							<Button onClick={() => {
								dispatch(setModalType("BOARD_FILTER_MODAL"))
								dispatch(setModalProps({type: "SCHEDULE", boardId: boardId}))
								dispatch(toggleShowModal(true))
							}} className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200 tw-bg-white hover:tw-bg-gray-50 tw-text-gray-700">
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<IconFilter className = {`${filterButtonState ? "tw-text-primary" : ""}`}/>
									<span>Filters</span>
								</div>
							</Button>
						)
					}}
				>
				</SearchToolBar>
			</FormProvider>
			{
				!isLoading && data?.data && boardId ? (
					<>
						<BulkEditToolbar 
							updateIds={(ids: Array<number>) => setSelectedIds(ids)} 
							applyActionToAll={bulkEditAction ? bulkEditAction : undefined}
							actionText={bulkEditAction ? "Bulk Edit" : undefined}
							itemIds={selectedIds} 
						>
							<>
								<button onClick={selectCurrentPageIds} className = "button">Select current page</button>	
								<button onClick={unselectCurrentPageIds} className = "button --secondary">Unselect current page</button>	
							</>
						</BulkEditToolbar>
						{
							data?.pagination.nextPage || data?.pagination.prevPage ? (
								<PaginationRow
									showNumResults={true}
									showPageNums={false}
									setPage={setPage}	
									paginationData={data?.pagination}
									currentPage={page}
								/>
							) : null
						}
						<div className = {tableClassName}>
							<Table 
								hideCheckAllBox={true} 
								data={data?.data} 
								config={config} 
								itemIds={selectedIds} 
								tableKey={key}
							></Table>
						</div>
						{
							stepButtonRow ? stepButtonRow : null
						}
					</>
				) : <RowContentLoading/> 
			}
			
		</div>
	)
}
