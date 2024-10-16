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

export type FormValues = {
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
	const {data: data, isFetching } = useGetTicketsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1
	})
	const ticketId = params.ticketId ? parseInt(params.ticketId) : undefined 
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = `${TICKETS}${ticketId ? `/${ticketId}` : ""}`
	const defaultForm: FormValues = {
		searchBy: searchParams.get("searchBy") ?? "title",
		query: searchParams.get("query") ?? "",
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const registerOptions = {
		searchBy: {"required": "Search By is Required"},
		query: {"required": "Search Query is required"},
	}

	const onSubmit = (values: FormValues) => {
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams({...values, page: "1"})
	}

	const setPage = (pageNum: number) => {
		let pageUrl = `${TICKETS}${ticketId ? `/${ticketId}` : ""}?page=${pageNum}`
		if (searchParams.get("query")){
			pageUrl += `&query=${searchParams.get("query")}`
		}
		if (searchParams.get("searchBy")){
			pageUrl += `&searchBy=${searchParams.get("searchBy")}`
		}
	    navigate(pageUrl, {replace:true});
	}

	const showTicket = (id: number) => {
		let pageUrl = `${TICKETS}/${id}?page=${currentPage}`
		if (searchParams.get("query")){
			pageUrl += `&query=${searchParams.get("query")}`
		}
		if (searchParams.get("searchBy")){
			pageUrl += `&searchBy=${searchParams.get("searchBy")}`
		}
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
						urlParams={{
							query: searchParams.get("query") ?? "",
							searchBy: searchParams.get("searchBy") ?? "",
						}}
						url={`${TICKETS}`}	
					/>
				</div>
				</>
			)}
		</div>
	)	
}