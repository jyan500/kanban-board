import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, TICKET_URL } from "../../helpers/urls" 
import { CustomError, Ticket } from "../../types/common" 
import { privateApi } from "../private"

export const ticketApi = privateApi.injectEndpoints({
	overrideExisting: false,
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