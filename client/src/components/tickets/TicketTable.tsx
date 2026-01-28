import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { ticketApi, useGetTicketsQuery } from "../../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Table } from "../Table"
import { useBoardTicketConfig } from "../../helpers/table-config/useBoardTicketConfig"
import { PaginationRow } from "../page-elements/PaginationRow"
import { BOARD_TICKET_URL } from "../../helpers/urls"
import { useForm, FormProvider } from "react-hook-form"
import { Ticket } from "../../types/common"
import { LoadingButton } from "../page-elements/LoadingButton"
import { SearchToolBar } from "./SearchToolBar"
import { Filters } from "../bulk-actions/Filters"
import { RowContentLoading } from "../page-elements/RowContentLoading"
import { BoardFilters, setFilters } from "../../slices/boardFilterSlice"
import { Button} from "../page-elements/Button"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { IconFilter } from "../icons/IconFilter"
import { FilterButton } from "../page-elements/FilterButton"
import { useBulkEditToolbar } from "../../contexts/BulkEditToolbarContext"
import { SEARCH_OPTIONS } from "../../helpers/constants"

interface Props {
	boardId: number | null | undefined
	selectedIds: Array<number>
	setSelectedIds: (ids: Array<number>) => void
	tableKey: string
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
	tableKey, 
	header, 
	boardId, 
	selectedIds, 
	setSelectedIds, 
	stepButtonRow, 
	bulkEditAction,
}: Props) => {
	const [ page, setPage ] = useState(1)

	const { filters, bulkEditFilters} = useAppSelector((state) => state.boardFilter)

	// if we're coming from the boards table, use the filters. Otherwise, use bulkEditFilters
	const selectedFilters = bulkEditAction != undefined ? filters : bulkEditFilters
	
	// Count active filters for the badge
	const numActiveFilters = Object.values(selectedFilters).filter(value => value !== null).length

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
		...(Object.keys(selectedFilters).reduce((acc: Record<string, any>, key) => {
			const typedKey = key as keyof BoardFilters
			if (selectedFilters[typedKey] == null){
				acc[typedKey] = "" 
			}
			else {
				acc[typedKey] = selectedFilters[typedKey]
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

	const { registerToolbar, unregisterToolbar } = useBulkEditToolbar()

	// Register toolbar config when component mounts or when relevant props change
	useEffect(() => {
		if (!isLoading && data?.data && boardId) {
			registerToolbar({
				itemIds: selectedIds,
				updateIds: (ids: Array<number>) => setSelectedIds(ids),
				applyActionToAll: bulkEditAction ? () => {
					bulkEditAction(selectedIds)
					unregisterToolbar()
					setSelectedIds([])
				} : undefined,
				actionText: bulkEditAction ? "Bulk Edit" : undefined,
				children: (
					<>
						<Button theme="primary" onClick={selectCurrentPageIds}>Select current page</Button>	
						<Button theme="secondary" onClick={unselectCurrentPageIds}>Unselect current page</Button>	
					</>
				)
			})
		}

		// Cleanup: unregister when component unmounts
		return () => {
			unregisterToolbar()
		}
	}, [selectedIds])

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
					searchOptions = {SEARCH_OPTIONS}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					hidePagination={true}
					additionalButtons={() => {
						return (
							<FilterButton 
								numFilters={numActiveFilters}
								onClick={() => {
									dispatch(setSecondaryModalType("BOARD_FILTER_MODAL"))
									dispatch(setSecondaryModalProps({boardId: boardId, isBulkEdit: bulkEditAction == undefined}))
									dispatch(toggleShowSecondaryModal(true))
								}}
							/>
						)
					}}
				>
				</SearchToolBar>
			</FormProvider>
			{
				!isLoading && data?.data && boardId ? (
					<>
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
								tableKey={tableKey}
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
