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
			}),
			providesTags: ["Tickets"],	
		}),
		getTicket: builder.query<Ticket, void>({
			query: (id) => ({
				url: `${TICKET_URL}/${id}`,
				method: "GET",
			}),
			providesTags: ["Tickets"],	
		}),
		addTicket: builder.mutation<{id: number, message: string}, Omit<Ticket, "organizationId" | "id">>({
			query: (ticket) => ({
				url: `${TICKET_URL}`,
				method: "POST",
				body: {
					name: ticket.name,
					description: ticket.description,
					priority_id: ticket.priorityId,
					ticket_type_id: ticket.ticketTypeId,
					status_id: ticket.statusId
				},
			}),
			invalidatesTags: ["Tickets"]
		})
	}),
})

export const { useGetTicketQuery, useGetTicketsQuery, useAddTicketMutation } = ticketApi 