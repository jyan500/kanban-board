import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, STATUS_URL } from "../../helpers/urls" 
import { CustomError, Status } from "../../types/common" 
import { privateApi } from "../private"

export const statusApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getStatuses: builder.query<Array<Status>, void>({
			query: () => ({
				url: STATUS_URL,
				method: "GET",
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

export const { useGetStatusQuery, useGetStatusesQuery, useBulkEditStatusesMutation } = statusApi