import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, STATUS_URL } from "../../helpers/urls" 
import { CustomError, Status } from "../../types/common" 
import { privateApi } from "../private"

type AddStatusRequest = {
	name: string
	isActive: boolean
	isCompleted: boolean
	order: number	
}

type UpdateStatusRequest = AddStatusRequest & {
	id: number
}

export const statusApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getStatuses: builder.query<Array<Status>, Record<string, any>>({
			query: ({params}) => ({
				url: STATUS_URL,
				method: "GET",
				params: params
			}),
			providesTags: ["Statuses"]

		}),
		getStatus: builder.query<Array<Status>, void>({
			query: (id) => ({
				url: `${STATUS_URL}/${id}`,
				method: "GET"
			}),
			providesTags: ["Statuses"]
		}),
		addStatus: builder.mutation<{message: string}, AddStatusRequest>({
			query: ({name, order, isActive, isCompleted}) => ({
				url: STATUS_URL,
				method: "POST",
				body: {
					name,
					order,
					is_active: isActive,
					is_completed: isCompleted,
				}
			}),
			invalidatesTags: ["Statuses", "BoardStatuses"]
		}),
		updateStatus: builder.mutation<{message: string}, UpdateStatusRequest>({
			query: ({id, name, order, isActive, isCompleted}) => ({
				url: `${STATUS_URL}/${id}`,
				method: "PUT",
				body: {
					name, order, is_active: isActive, is_completed: isCompleted,
				}
			}),
			invalidatesTags: ["Statuses", "BoardStatuses"]
		}),
		updateOrder: builder.mutation<{message: string}, Array<{id: number, order: number}>>({
			query: (body) => ({
				url: `${STATUS_URL}/update-order`,
				method: "POST",
				body: {
					statuses: body 
				},
			}),
			invalidatesTags: ["Statuses", "BoardStatuses"]
		}),
		bulkEditStatuses: builder.mutation<string, Array<Pick<Status, "id" | "isActive">>>({
			query: (statuses) => ({
				url: `${STATUS_URL}/bulk-edit`,
				method: "POST",
				body: {
					statuses: statuses.map((status) => ({id: status.id, is_active: status.isActive}))
				}
			}),
			invalidatesTags: ["Statuses", "BoardStatuses"] 	
		})
	}),
})

export const { 
	useGetStatusQuery, 
	useGetStatusesQuery, 
	useBulkEditStatusesMutation, 
	useAddStatusMutation, 
	useUpdateStatusMutation,
	useUpdateOrderMutation,
} = statusApi
