import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	TICKET_URL, 
	TICKET_ASSIGNEES_URL, 
	TICKET_BULK_EDIT_ASSIGNEES_URL } 
from "../../helpers/urls" 
import { CustomError, Ticket, UserProfile } from "../../types/common" 
import { privateApi } from "../private"

type TicketAssigneeRequest = {
	ticketId: number
	userIds: Array<number>
}

type TicketAssigneeResponse = {
	message: string
}

export const ticketApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getTickets: builder.query<Array<Ticket>, Record<string, any>>({
			query: (urlParams) => ({
				url: TICKET_URL,
				method: "GET",
			}),
			providesTags: ["Tickets"],	
			// providesTags: (result, error, arg) =>
			// 	result
			// 		? [...result.map(({id}) => ({ type: "Tickets" as const, id})), "Tickets"]
			// 		: ["Tickets"]
		}),
		getTicket: builder.query<Array<Ticket>, number>({
			query: (id) => ({
				url: `${TICKET_URL}/${id}`,
				method: "GET",
			}),
			providesTags: ["Tickets"],	
		}),
		getTicketAssignees: builder.query<Array<UserProfile>, number>({
			query: (ticketId) => ({
				url: TICKET_ASSIGNEES_URL(ticketId),
				method: "GET",
			}),
			providesTags: ["TicketAssignees"]
		}),
		bulkEditTicketAssignees: builder.mutation<TicketAssigneeResponse, TicketAssigneeRequest>({
			query: ({ticketId, userIds}) => ({
				url: TICKET_BULK_EDIT_ASSIGNEES_URL(ticketId),	
				method: "POST",
				body: {
					user_ids: userIds 
				}
			}),
			invalidatesTags: ["TicketAssignees"]
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
		}),
		updateTicket: builder.mutation<{message: string}, Omit<Ticket, "organizationId">>({
			query: (ticket) => ({
				url: `${TICKET_URL}/${ticket.id}`,
				method: "PUT",
				body: {
					id: ticket.id,
					name: ticket.name,
					description: ticket.description,
					priority_id: ticket.priorityId,
					ticket_type_id: ticket.ticketTypeId,
					status_id: ticket.statusId
				}
			}),
			invalidatesTags: ["Tickets", "BoardTickets"]
			// invalidatesTags: (result, error, arg) => [{type: "Tickets", id: arg.id}, {type: "BoardTickets", id: arg.id}]
		}),
		deleteTicket: builder.mutation<{message: string}, number>({
			query: (ticketId) => ({
				url: `${TICKET_URL}/${ticketId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tickets"]
		})
	}),
})

export const { 
	useGetTicketQuery, 
	useGetTicketsQuery, 
	useAddTicketMutation, 
	useUpdateTicketMutation,
	useDeleteTicketMutation,
	useGetTicketAssigneesQuery,
	useBulkEditTicketAssigneesMutation,
} = ticketApi 