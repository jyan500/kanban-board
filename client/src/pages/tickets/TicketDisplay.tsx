import React, { useEffect, useState } from "react"
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
import { Button } from "../../components/page-elements/Button"
import { TicketFilters, setFilters, setFilterButtonState } from "../../slices/ticketFilterSlice"
import { IconFilter } from "../../components/icons/IconFilter"
import { FilterButton } from "../../components/page-elements/FilterButton"
import { setSecondaryModalProps, setSecondaryModalType, toggleShowSecondaryModal } from "../../slices/secondaryModalSlice"

export type FormValues = {
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
	const { filters, filterButtonState } = useAppSelector((state) => state.ticketFilter)
	
	// Count active filters for the badge
	const numActiveFilters = Object.values(filters).filter(value => value !== null).length

	const {data: data, isLoading } = useGetTicketsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1,
		includeAssignees: true,
		...(Object.keys(filters).reduce((acc: Record<string, any>, key) => {
			const typedKey = key as keyof TicketFilters
			if (filters[typedKey] == null){
				acc[typedKey] = "" 
			}
			else {
				acc[typedKey] = filters[typedKey]
			}
			return acc	
		}, {} as Record<string, any>)),
	})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`
	const defaultForm: FormValues = {
		query: searchParams.get("query") ?? "",
		searchBy: searchParams.get("searchBy") ?? "title",
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const registerOptions = {
	}

	/* when filters are changed, add to search params */
	useEffect(() => {
		const parsedValues = Object.fromEntries(
			Object.entries(filters).map(([key, value]) => [key, value === null ? "" : value])
		) as FormValues
		setSearchParams(prev => ({
			...Object.fromEntries(prev),
			...parsedValues,
			page: "1",
		}))
	}, [filters])

	// if there are any search params, add those to the filter
	useEffect(() => {
		const filterKeys = Object.keys(filters) // adjust keys as needed for your filters
		const filtersFromParams: Record<string, any> = {};
		filterKeys.forEach((key) => {
			if (searchParams.get(key)){
				const value = searchParams.get(key) 
				const numValue = Number(value);
				filtersFromParams[key] = value === "" ? null : (isNaN(numValue) ? value : numValue);
			}
		})
		if (Object.keys(filtersFromParams).length > 0) {
			dispatch(setFilters({
				...filters,
				...filtersFromParams
			}));
		}
	}, [searchParams])

	const onSubmit = (values: FormValues) => {
		// replace any null values with ""
		const parsedValues = Object.fromEntries(
			Object.entries(values).map(([key, value]) => [key, value === null ? "" : value])
		) as FormValues
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams(prev => ({
			...Object.fromEntries(prev),
			...parsedValues,
			page: "1",
		}))
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
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<FilterButton 
					filterButtonState={filterButtonState}
					numFilters={numActiveFilters}
					onClick={() => {
						dispatch(setSecondaryModalType("TICKET_FILTER_MODAL"))
						dispatch(toggleShowSecondaryModal(true))
					}}
				/>
				<button className="button" onClick={(e) => {
				e.preventDefault()
				showAddTicketModal()
				}}>Add Ticket</button>
			</div>
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
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
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
					<div className = "tw-w-fit tw-p-4 tw-border tw-border-gray-300">
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