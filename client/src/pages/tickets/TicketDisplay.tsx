import React, { useState } from "react"
import { useGetTicketsQuery } from "../../services/private/ticket" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Ticket } from "../../types/common"
import { TICKETS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { TicketRow } from "../../components/TicketRow"
import { SearchToolBar } from "../../components/tickets/SearchToolBar"
import { useForm, FormProvider } from "react-hook-form"

export type Filters = {
	ticketType: string
	priority: string
	board: string
}

export type FormValues = Filters & {
	searchBy: string
	query: string	
}

type StateSearchParams = FormValues & {
	page: number | string 
}

export const TicketDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const params = useParams<{ticketId: string}>()
	const navigate = useNavigate()
	const filters: Filters = {
		"ticketType": searchParams.get("ticketType") ?? "",
		"priority": searchParams.get("priority") ?? "",
		"board": searchParams.get("board") ?? "",
	}
	const {data: data, isFetching } = useGetTicketsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1,
		...filters
	})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`
	const defaultForm: FormValues = {
		query: searchParams.get("query") ?? "",
		searchBy: searchParams.get("searchBy") ?? "title",
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

	const withUrlParams = (pageUrl: string) => {
		Object.keys(defaultForm).forEach((key) => {
			pageUrl += `&${key}=${searchParams.get(key)}`
		})
		return pageUrl
	}

	const onSubmit = (values: FormValues) => {
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams({
			page: "1",
			...values
		})
	}

	const setPage = (pageNum: number) => {
		let pageUrl = `${TICKETS}${ticketId ? `/${ticketId}` : ""}?page=${pageNum}`
		pageUrl = withUrlParams(pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	const showTicket = (id: number) => {
		let pageUrl = `${TICKETS}/${id}?page=${currentPage}`
		pageUrl = withUrlParams(pageUrl)
		navigate(pageUrl)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<h1>Tickets Backlog</h1>
			<FormProvider {...methods}>
				<SearchToolBar 
					paginationData={data?.pagination} 
					setPage={setPage} 
					currentPage={currentPage ?? 1}
					registerOptions={registerOptions}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					filters={Object.keys(filters)}
				/>
			</FormProvider>
			{isFetching ? <LoadingSpinner/> : (
				<>
				<div className = "tw-flex tw-flex-row tw-gap-x-6">
					<div className = "tw-w-1/3 tw-flex tw-flex-col tw-gap-y-4">
						
						{data?.data?.map((ticket: Ticket) => {
							return (
								<button className = "hover:tw-gray-50" onClick={() => showTicket(ticket.id)}>
									<TicketRow ticket={ticket}/>
								</button>
							)
						})}
					</div>
					<div className = "tw-w-2/3 tw-flex tw-flex-col tw-gap-y-4">
						<Outlet/>
					</div>
				</div>
				<div className = "tw-p-4 tw-border tw-border-gray-300">
					<PaginationRow
						showPageNums={true}
						setPage={setPage}	
						paginationData={data?.pagination}
						currentPage={currentPage}
						urlParams={defaultForm}
						url={`${TICKETS}`}	
					/>
				</div>
				</>
			)}
		</div>
	)	
}