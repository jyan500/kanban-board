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
	TICKET_ACTIVITY_URL,
	TICKET_SUMMARY_URL,
} 
from "../../helpers/urls" 
import { CustomError, Mention, ListResponse, Ticket, TicketComment, TicketActivity, TicketRelationship, UserProfile } from "../../types/common" 
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
			invalidatesTags: ["TicketComments", "TicketSummary"]
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
			invalidatesTags: ["TicketComments", "TicketSummary"]
		}),
		deleteTicketComment: builder.mutation<{message: string}, DeleteTicketCommentRequest>({
			query: ({ticketId, commentId}) => ({
				url: TICKET_COMMENT_URL(ticketId, commentId),
				method: "DELETE"
			}),
			invalidatesTags: ["TicketComments", "TicketSummary"]
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
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets", "TicketSummary", "BoardSummary"]
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
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets", "TicketSummary", "BoardSummary"],
		}),
		deleteTicketAssignee: builder.mutation<TicketAssigneeResponse, SingleTicketAssigneeRequest>({
			query: ({ticketId, userId, isWatcher}) => ({
				url: TICKET_ASSIGNEE_URL(ticketId, userId),
				method: "DELETE",
				body: {
					user_id: userId,
					ticket_id: ticketId,
					is_watcher: isWatcher
				}
			}),
			invalidatesTags: ["TicketAssignees", "Tickets", "BoardTickets", "TicketSummary", "BoardSummary"],
		}),
		addTicket: builder.mutation<{id: number, message: string, mentions: Array<Mention>}, Omit<Ticket, "organizationId" | "id" | "createdAt" | "storyPoints" | "dueDate">>({
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
			invalidatesTags: ["Tickets", "BoardTickets", "BoardSummary"]
		}),
		updateTicket: builder.mutation<{message: string, mentions: Array<Mention>}, Omit<Ticket, "organizationId" | "createdAt" | "userIdOption" | "userId">>({
			query: (ticket) => ({
				url: `${TICKET_URL}/${ticket.id}`,
				method: "PUT",
				body: {
					id: ticket.id,
					name: ticket.name,
					description: ticket.description,
					story_points: ticket.storyPoints,
					due_date: ticket.dueDate,
					priority_id: ticket.priorityId,
					ticket_type_id: ticket.ticketTypeId,
					status_id: ticket.statusId
				}
			}),
			invalidatesTags: [
				"Tickets", 
				"BoardTickets", 
				"TicketRelationships", 
				"TicketSummary", 
				"Sprints", 
				"SprintTickets", 
				"BoardSummary"
			]
			// invalidatesTags: (result, error, arg) => [{type: "Tickets", id: arg.id}, {type: "BoardTickets", id: arg.id}]
		}),
		bulkEditTickets: builder.mutation<{message: string}, {ticketIds: Array<number>, priorityId: number, userIds: Array<number>, statusId: number}>({
			query: ({ticketIds, priorityId, userIds, statusId}) => ({
				url: `${TICKET_URL}/bulk-edit`,
				method: "POST",
				body: {
					ticket_ids: ticketIds,
					priority_id: priorityId,
					user_ids: userIds,
					status_id: statusId,
				}
			}),
			invalidatesTags: [
				"Tickets", 
				"BoardTickets", 
				"TicketRelationships", 
				"TicketSummary",
				"Sprints",
				"SprintTickets",
				"BoardSummary",
			]
		}),
		bulkWatchTickets: builder.mutation<{message: string}, {toAdd: boolean, ticketIds: Array<number>, userId: number}>({
			query: ({ticketIds, userId, toAdd}) => ({
				url: `${TICKET_URL}/bulk-watch`,	
				method: "POST",
				body: {
					ticket_ids: ticketIds,
					user_id: userId,
					to_add: toAdd,
				}
			}),
			invalidatesTags: ["Tickets", "BoardTickets", "TicketSummary"]
		}),
		deleteTicket: builder.mutation<{message: string}, number>({
			query: (ticketId) => ({
				url: `${TICKET_URL}/${ticketId}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tickets", "BoardTickets", "TicketRelationships", "BoardSummary"]
		}),
		updateTicketStatus: builder.mutation<{message: string}, {ticketId: number, statusId: number}>({
			query: ({ticketId, statusId}) => ({
				url: TICKET_STATUS_URL(ticketId),
				method: "PATCH",
				body: {status_id: statusId}
			}),
			invalidatesTags: ["Tickets", "BoardTickets", "TicketRelationships", "TicketSummary", "BoardSummary"]
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
		getTicketActivities: builder.query<ListResponse<TicketActivity>, {ticketId: number, params: Record<string, any>}>({
			query: ({ticketId, params}) => ({
				url: TICKET_ACTIVITY_URL(ticketId, ""),
				method: "GET",
				params: params
			}),
			providesTags: ["TicketActivity"]
		}),
		getTicketActivity: builder.query<TicketActivity, {ticketId: number, activityId: number}>({
			query: ({ticketId, activityId}) => ({
				url: TICKET_ACTIVITY_URL(ticketId, activityId),
				method: "GET"
			}),
			providesTags: ["TicketActivity"]
		}),
		addTicketActivity: builder.mutation<{message: string}, {ticketId: number, body: Omit<TicketActivity, "id" | "ticketId" | "createdAt" | "userId">}>({
			query: ({ticketId, body}) => ({
				url: TICKET_ACTIVITY_URL(ticketId, ""),
				method: "POST",
				body: {
					minutes_spent: body.minutesSpent,	
					description: body.description,
				}
			}),
			invalidatesTags: ["TicketActivity", "Boards"]
		}),
		updateTicketActivity: builder.mutation<{message: string}, {ticketId: number, body: Omit<TicketActivity, "ticketId" | "createdAt" | "userId">}>({
			query: ({ticketId, body}) => ({
				url: TICKET_ACTIVITY_URL(ticketId, body.id),
				method: "PUT",
				body: {
					ticket_id: ticketId,
					minutes_spent: body.minutesSpent,
					description: body.description,
				}
			}),
			invalidatesTags: ["TicketActivity", "Boards"]
		}),
		deleteTicketActivity: builder.mutation<{message: string}, {ticketId: number, activityId: number}>({
			query: ({ticketId, activityId}) => ({
				url: TICKET_ACTIVITY_URL(ticketId, activityId),
				method: "DELETE",
			}),
			invalidatesTags: ["TicketActivity", "Boards"]
		}),
		getTicketSummary: builder.query<{message: string, timestamp: Date}, {ticketId: number}>({
			query: ({ticketId}) => ({
				url: TICKET_SUMMARY_URL(ticketId),	
				method: "GET",
			}),
			providesTags: ["TicketSummary"]
		})
	}),
})

export const { 
	useGetTicketQuery, 
	useGetTicketsQuery, 
	useLazyGetTicketSummaryQuery,
	useLazyGetTicketsQuery,
	useAddTicketMutation, 
	useBulkEditTicketsMutation,
	useBulkWatchTicketsMutation,
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
	useGetTicketActivitiesQuery,
	useGetTicketActivityQuery,
	useAddTicketActivityMutation,
	useUpdateTicketActivityMutation,
	useDeleteTicketActivityMutation,
} = ticketApi 
