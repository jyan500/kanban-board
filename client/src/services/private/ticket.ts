import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	TICKET_URL, 
	TICKET_COMMENT_URL,
	TICKET_ASSIGNEES_URL, 
	TICKET_BULK_EDIT_ASSIGNEES_URL } 
from "../../helpers/urls" 
import { CustomError, Ticket, TicketComment, UserProfile } from "../../types/common" 
import { privateApi } from "../private"

type TicketAssigneeRequest = {
	ticketId: number
	userIds: Array<number>
}

type TicketAssigneeResponse = {
	message: string
}

type AddTicketCommentRequest = {
	ticketId: number
	comment: Omit<TicketComment, "id" | "createdAt">
}

type UpdateTicketCommentRequest = {
	ticketId: number
	comment: Omit<TicketComment, "createdAt">
}

type DeleteTicketCommentRequest = {
	ticketId: number
	commentId: number
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
		getTicketComments: builder.query<Array<TicketComment>, number>({
			query: (ticketId) => ({
				url: TICKET_COMMENT_URL(ticketId, ""),
				method: "GET"
			}),
			providesTags: ["TicketComments"]
		}),
		addTicketComment: builder.mutation<{id: number, message: string}, AddTicketCommentRequest>({
			query: ({ticketId, comment}) => ({
				url: TICKET_COMMENT_URL(ticketId, ""),
				method: "POST",
				body: {
					ticket_id: comment.ticketId,
					user_id: comment.userId,
					comment: comment.comment
				}
			}),
			invalidatesTags: ["TicketComments"]
		}),
		updateTicketComment: builder.mutation<{id: number, message: string}, UpdateTicketCommentRequest>({
			query: ({ticketId, comment}) => ({
				url: TICKET_COMMENT_URL(ticketId, comment.id),
				method: "PUT",
				body: {
					id: comment.id,
					ticket_id: comment.ticketId,
					user_id: comment.userId,
					comment: comment.comment
				}
			}),
			invalidatesTags: ["TicketComments"]
		}),
		deleteTicketComment: builder.mutation<{message: string}, DeleteTicketCommentRequest>({
			query: ({ticketId, commentId}) => ({
				url: TICKET_COMMENT_URL(ticketId, commentId),
				method: "DELETE"
			}),
			invalidatesTags: ["TicketComments"]
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
		addTicket: builder.mutation<{id: number, message: string}, Omit<Ticket, "organizationId" | "id" | "createdAt">>({
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
		updateTicket: builder.mutation<{message: string}, Omit<Ticket, "organizationId" | "createdAt">>({
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
	useGetTicketCommentsQuery,
	useAddTicketCommentMutation,
	useUpdateTicketCommentMutation,
	useDeleteTicketCommentMutation,
	useBulkEditTicketAssigneesMutation,
} = ticketApi 