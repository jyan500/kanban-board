import React, { useState } from "react"
import { ticketApi, useGetTicketsQuery } from "../../services/private/ticket" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Ticket, OptionType } from "../../types/common"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TicketRow } from "../../components/TicketRow"
import { SearchToolBar } from "../../components/tickets/SearchToolBar"
import { useForm, FormProvider } from "react-hook-form"
import { withUrlParams } from "../../helpers/functions"
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice"
import { Filters } from "../../components/tickets/Filters"
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"

export type Filters = {
	ticketType: string
	priority: string
	board: string
	status: string
}

export type FormValues = {
	ticketType: string
	priority: string
	searchBy: string
	query: string	
}

type StateSearchParams = FormValues & {
	page: number | string 
}

export const TicketDisplay = () => {
	const dispatch = useAppDispatch()
	const { statuses: allStatuses } = useAppSelector((state) => state.status)
	const [searchParams, setSearchParams] = useSearchParams()
	const params = useParams<{ticketId: string}>()
	const navigate = useNavigate()
	const filters: Filters = {
		"ticketType": searchParams.get("ticketType") ?? "",
		"priority": searchParams.get("priority") ?? "",
		"board": searchParams.get("board") ?? "",
		"status": searchParams.get("status") ?? "",
	}
	const {data: data, isLoading } = useGetTicketsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1,
		includeAssignees: true,
		...filters
	})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`
	const defaultForm: FormValues = {
		...filters,
		query: searchParams.get("query") ?? "",
		searchBy: searchParams.get("searchBy") ?? "title",
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const registerOptions = {
	}

	const onSubmit = (values: FormValues) => {
		// replace any null values with ""
		const parsedValues = Object.fromEntries(
			Object.entries(values).map(([key, value]) => [key, value === null ? "" : value])
		) as FormValues
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams({
			page: "1",
			...parsedValues
		})
	}

	const setPage = (pageNum: number) => {
		let pageUrl = `${TICKETS}${ticketId ? `/${ticketId}` : ""}?page=${pageNum}`
		pageUrl = withUrlParams(defaultForm, searchParams, pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	const showTicket = (id: number) => {
		let pageUrl = `${TICKETS}/${id}?page=${currentPage}`
		pageUrl = withUrlParams(defaultForm, searchParams, pageUrl)
		navigate(pageUrl)
	}

	const showAddTicketModal = () => {
		dispatch(toggleShowModal(true))
		dispatch(setModalType("ADD_TICKET_FORM"))
		dispatch(setModalProps({
			statusesToDisplay: allStatuses	
		}))
	}

	const additionalButtons = () => {
		return (
			<button className="button" onClick={(e) => {
			e.preventDefault()
			showAddTicketModal()
			}}>Add Ticket</button>
		)
	}

	const renderFilter = () => {
		return (
			<Filters/>
		)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<h1>Tickets</h1>
			<FormProvider {...methods}>
				<SearchToolBar 
					paginationData={data?.pagination} 
					setPage={setPage} 
					currentPage={currentPage ?? 1}
					registerOptions={registerOptions}
					searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
					additionalButtons={additionalButtons}
					renderFilter={renderFilter}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					showFilters={!(Object.values(filters).every((val: string) => val === "" || val == null))}
					filters={Object.keys(filters)}
				>
				</SearchToolBar>
			</FormProvider>
			{isLoading ? 
			<LoadingSkeleton width = "lg:tw-w-1/3 tw-w-full" height="lg:tw-max-h-full tw-h-[500px]">
				<RowPlaceholder/>
			</LoadingSkeleton> : (
				<>
				<div className = "tw-flex tw-flex-col lg:tw-flex-row tw-gap-y-6 lg:tw-gap-x-6">
					<div className = "tw-w-full tw-max-h-[300px] tw-overflow-y-auto lg:tw-overflow-hidden lg:tw-max-h-full lg:tw-w-1/3 tw-flex tw-flex-col tw-gap-y-2">
						
						{data?.data?.map((ticket: Ticket) => {
							return (
								<button key = {`ticket_display_row_${ticket.id}`} className = "hover:tw-gray-50" onClick={() => showTicket(ticket.id)}>
									<TicketRow ticket={ticket}/>
								</button>
							)
						})}
					</div>
					<div className = "tw-w-full lg:tw-w-2/3 tw-flex tw-flex-col tw-gap-y-6">
						<Outlet/>
					</div>
				</div>
				{
					data?.pagination?.prevPage || data?.pagination?.nextPage ? 
					<div className = "tw-p-4 tw-border tw-border-gray-300">
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setPage}	
							paginationData={data?.pagination}
							currentPage={currentPage}
							urlParams={defaultForm}
							url={`${TICKETS}${ticketId ? `/${ticketId}` : ""}`}	
						/>
					</div> : null
				}
				</>
			)}
		</div>
	)	
}