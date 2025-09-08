import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store"
import {
	BACKEND_BASE_URL,
	SPRINT_URL,
} from "../../helpers/urls"
import { CustomError, Ticket, Sprint, ListResponse } from "../../types/common"
import { privateApi } from "../private"
import { parseURLParams } from "../../helpers/functions"

export const sprintApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getSprints: builder.query<ListResponse<Sprint>, { urlParams: Record<string, any> }>({
			query: ({ urlParams }) => ({
				url: `${SPRINT_URL}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Sprints"]
		}),
		getSprint: builder.query<Sprint, { id: number | string, urlParams: Record<string, any> }>({
			query: ({ id, urlParams }) => ({
				url: `${SPRINT_URL}/${id}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Sprints"]
		}),
		addSprint: builder.mutation<{id: Number, message: string}, Omit<Sprint, "id" | "organizationId" | "userId" | "isCompleted" | "tickets" | "debrief">>({
			query: ({ name, goal, boardId, startDate, endDate }) => ({
				url: SPRINT_URL,
				body: {
					name,
					goal,
					board_id: boardId,
					start_date: startDate,
					end_date: endDate,
				},
				method: "POST",
			}),
			invalidatesTags: ["Sprints"]
		}),
		updateSprint: builder.mutation<{message: string}, Pick<Sprint, "id" | "name" | "goal" | "debrief" | "isCompleted" | "startDate" | "endDate">>({
			query: ({ id, name, goal, startDate, endDate, debrief, isCompleted }) => ({
				url: `${SPRINT_URL}/${id}`,
				body: {
					name,
					goal,
					start_date: startDate,
					end_date: endDate,
					debrief,
					is_completed: isCompleted,
				},
				method: "PUT",
			}),
			invalidatesTags: ["Sprints"]
		}),
		deleteSprint: builder.mutation<{message: string}, number>({
			query: (id) => ({
				url: `${SPRINT_URL}/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Sprints"]
		}),
        getSprintTickets: builder.query<ListResponse<Ticket>, {sprintId: number, urlParams: Record<string, any>}>({
            query: ({sprintId, urlParams}) => ({
                url: `${SPRINT_URL}/${sprintId}/ticket`,
                method: "GET",
                params: urlParams
            }),
            providesTags: ["SprintTickets"]
        }),
        updateSprintTickets: builder.mutation<{message: string}, {sprintId: number, ticketIds: Array<number>}>({
            query: ({sprintId, ticketIds}) => ({
                url: `${SPRINT_URL}/${sprintId}/ticket`,
                method: "POST",
                body: {
                    ticket_ids: ticketIds
                }
            }),
            invalidatesTags: ["SprintTickets"]
        }),
        deleteSprintTickets: builder.mutation<{message: string}, {sprintId: number, ticketIds: Array<number>}>({
            query: ({sprintId, ticketIds}) => ({
                url: `${SPRINT_URL}/${sprintId}/ticket`,
                method: "DELETE",
                body: {
                    ticket_ids: ticketIds
                }
            }),
            invalidatesTags: ["SprintTickets"]
        })
	}),
})

export const {
	useGetSprintsQuery,
	useGetSprintQuery,
	useAddSprintMutation,
	useUpdateSprintMutation,
	useDeleteSprintMutation,
	useLazyGetSprintTicketsQuery,
	useGetSprintTicketsQuery,
	useUpdateSprintTicketsMutation,
	useDeleteSprintTicketsMutation,
} = sprintApi
