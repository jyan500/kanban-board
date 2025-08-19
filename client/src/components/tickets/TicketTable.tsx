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
import { SearchToolBar } from "./SearchToolBar"
import { Filters } from "../bulk-actions/Filters"
import { RowContentLoading } from "../page-elements/RowContentLoading"

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

type Filters = {
	ticketType: string
	priority: string
	status: string
}

export type FormValues = Filters & {
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

	const filters: Filters = {
		ticketType: "",
		priority: "",
		status: ""
	}

	const defaultForm: FormValues = {
		query: "",
		searchBy: "title",
		...filters
	}

	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods

	const registerOptions = {
		searchBy: {"required": "Search By is Required"},
		query: {"validate": (value: string) => {
			const allFilters = Object.keys(filters).map((filter: string) => watch(filter as keyof Filters))
			if (value === "" && allFilters.every((val: string) => val === "")){
				return "Search Query is required"
			}
			return true
		}},
	}

	const { data, isLoading, isFetching, isError } = useGetTicketsQuery({
		page: page,
		board: boardId,
		sortBy: "createdAt",
		order: "desc",
		includeAssignees: true,
		...preloadedValues,	
	})

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

	const renderFilter = () => {
		return (<Filters/>)
	}

	const config = useBoardTicketConfig(true, selectedIds, setSelectedIds)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<h3 className = "tw-m-0">{header}</h3>	
			<FormProvider {...methods}>
				<SearchToolBar 
					paginationData={data?.pagination} 
					setPage={setPage} 
					currentPage={page ?? 1}
					registerOptions={registerOptions}
					searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
					renderFilter={renderFilter}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					showFilters={!(Object.values(filters).every((val: string) => val === "" || val == null))}
					filters={Object.keys(filters)}
					hidePagination={true}
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
