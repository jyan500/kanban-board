import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store" 
import { BACKEND_BASE_URL, TICKET_URL } from "../helpers/urls" 
import { CustomError, Ticket } from "../types/common" 

export const ticketApi = createApi({
	reducerPath: "ticketApi",
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
	        const token = (getState() as RootState).auth.token;
	        if (token) {
		        headers.set('Authorization', `Bearer ${token}`)
	        }
	    
	        return headers
	    },
	}) as BaseQueryFn<string | FetchArgs, unknown, CustomError, {}>,
	endpoints: (builder) => ({
		getTickets: builder.query<Ticket, void>({
			query: () => ({
				url: TICKET_URL,
				method: "GET",
			})	
		}),
		getTicket: builder.query<Ticket, void>({
			query: (id) => ({
				url: `${TICKET_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { useGetTicketQuery, useGetTicketsQuery } = ticketApi 