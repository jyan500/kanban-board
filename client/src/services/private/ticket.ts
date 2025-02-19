import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	TICKET_URL, 
	TICKET_COMMENT_URL,
	TICKET_STATUS_URL,
	TICKET_ASSIGNEES_URL, 
	TICKET_ASSIGNEE_URL,
	TICKET_BULK_EDIT_ASSIGNEES_URL ,
	TICKET_RELATIONSHIP_URL,
} 
from "../../helpers/urls" 
import { CustomError, Mention, ListResponse, Ticket, TicketComment, TicketRelationship, UserProfile } from "../../types/common" 
import { privateApi } from "../private"

type TicketAssigneeRequest = {
	ticketId: number
	isWatcher: boolean
	userIds: Array<number>
}

type SingleTicketAssigneeRequest = {
	ticketId: number
	userId: number
	isWatcher?: boolean
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

type AddTicketRelationshipRequest = {
	parentTicketId: number
	childTicketId: number
	ticketRelationshipTypeId: number
}

type DeleteTicketRelationshipRequest = {
	ticketId: number
	ticketRelationshipId: number
}

type TicketEntityPaginationRequest = {
	ticketId: number | string
	params: Record<string, any>
}

export const ticketApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getTickets: builder.query<ListResponse<Ticket>, Record<string, any>>({
			query: (urlParams) => ({
				url: TICKET_URL,
				method: "GET",
				params: urlParams
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
		getTicketComments: builder.query<ListResponse<TicketComment>, TicketEntityPaginationRequest>({
			query: ({ticketId, params}) => ({
				url: TICKET_COMMENT_URL(ticketId, ""),
				method: "GET",
				params: params
			}),
			providesTags: ["TicketComments"]
		}),
		addTicketComment: builder.mutation<{id: number, message: string, mentions: Array<Mention>}, AddTicketCommentRequest>({
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
		updateTicketComment: builder.mutation<{id: number, message: string, mentions: Array<Mention>}, UpdateTicketCommentRequest>({
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
		getTicketAssignees: builder.query<Array<UserProfile>, {ticketId: number | string, params: Record<string, any>}>({
			query: ({ticketId, params}) => ({
				url: TICKET_ASSIGNEES_URL(ticketId),
				method: "GET",
				params: params
			}),
			providesTags: ["TicketAssignees"]
		}),
		bulkEditTicketAssignees: builder.mutation<TicketAssigneeResponse, TicketAssigneeRequest>({
			query: ({ticketId, userIds, isWatcher}) => ({
				url: TICKET_BULK_EDIT_ASSIGNEES_URL(ticketId),	
				method: "POST",
				body: {
					user_ids: userIds,
					is_watcher: isWatcher
				}
			}),
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets"]
		}),
		addTicketAssignee: builder.mutation<TicketAssigneeResponse, TicketAssigneeRequest>({
			query: ({ticketId, userIds, isWatcher}) => ({
				url: TICKET_ASSIGNEES_URL(ticketId),
				method: "POST",
				body: {
					user_ids: userIds,
					is_watcher: isWatcher
				}
			}),
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets"],
		}),
		deleteTicketAssignee: builder.mutation<TicketAssigneeResponse, SingleTicketAssigneeRequest>({
			query: ({ticketId, userId}) => ({
				url: TICKET_ASSIGNEE_URL(ticketId, userId),
				method: "DELETE",
				body: {
					user_id: userId,
					ticket_id: ticketId
				}
			}),
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets"],
		}),
		addTicket: builder.mutation<{id: number, message: string, mentions: Array<Mention>}, Omit<Ticket, "organizationId" | "id" | "createdAt" | "storyPoints" | "minutesSpent" | "dueDate">>({
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
			invalidatesTags: ["Tickets", "BoardTickets"]
		}),
		updateTicket: builder.mutation<{message: string, mentions: Array<Mention>}, Omit<Ticket, "organizationId" | "createdAt">>({
			query: (ticket) => ({
				url: `${TICKET_URL}/${ticket.id}`,
				method: "PUT",
				body: {
					id: ticket.id,
					name: ticket.name,
					description: ticket.description,
					story_points: ticket.storyPoints,
					due_date: ticket.dueDate,
					minutes_spent: ticket.minutesSpent,
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
			invalidatesTags: ["Tickets", "BoardTickets"]
		}),
		updateTicketStatus: builder.mutation<{message: string}, {ticketId: number, statusId: number}>({
			query: ({ticketId, statusId}) => ({
				url: TICKET_STATUS_URL(ticketId),
				method: "PATCH",
				body: {status_id: statusId}
			}),
			invalidatesTags: ["Tickets", "BoardTickets"]
		}),
		getTicketRelationships: builder.query<ListResponse<TicketRelationship>, TicketEntityPaginationRequest>({
			query: ({ticketId, params}) => ({
				url: `${TICKET_RELATIONSHIP_URL(ticketId, "")}`,
				method: "GET",
				params: params
			}),
			providesTags: ["TicketRelationships"]
		}),
		addTicketRelationship: builder.mutation<{id: number, message: string}, AddTicketRelationshipRequest>({
			query: ({parentTicketId, childTicketId, ticketRelationshipTypeId}) => ({
				url: TICKET_RELATIONSHIP_URL(parentTicketId, ""),
				method: "POST",
				body: {
					parent_ticket_id: parentTicketId, 
					child_ticket_id: childTicketId, 
					ticket_relationship_type_id: ticketRelationshipTypeId
				}
			}),
			// TODO: should not invalidate all tickets and board tickets, just the specific ticket that was changed
			invalidatesTags: ["BoardTickets", "Tickets", "TicketRelationships"]
		}),
		deleteTicketRelationship: builder.mutation<{message: string}, DeleteTicketRelationshipRequest>({
			query: ({ticketId, ticketRelationshipId}) => ({
				url: TICKET_RELATIONSHIP_URL(ticketId, ticketRelationshipId),
				method: "DELETE",
			}),	
			// TODO: should not invalidate all tickets and board tickets, just the specific ticket that was changed
			invalidatesTags: ["BoardTickets", "Tickets", "TicketRelationships"]
		}),
	}),
})

export const { 
	useGetTicketQuery, 
	useGetTicketsQuery, 
	useAddTicketMutation, 
	useUpdateTicketMutation,
	useUpdateTicketStatusMutation,
	useDeleteTicketMutation,
	useGetTicketAssigneesQuery,
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation,
	useGetTicketCommentsQuery,
	useAddTicketCommentMutation,
	useUpdateTicketCommentMutation,
	useDeleteTicketCommentMutation,
	useBulkEditTicketAssigneesMutation,
	useGetTicketRelationshipsQuery,
	useAddTicketRelationshipMutation,
	useDeleteTicketRelationshipMutation,
} = ticketApi 