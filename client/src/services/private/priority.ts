import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, PRIORITY_URL } from "../../helpers/urls" 
import { CustomError, Priority } from "../../types/common" 
import { privateApi } from "../private"

export const priorityApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getPriorities: builder.query<Array<Priority>, void>({
			query: () => ({
				url: PRIORITY_URL,
				method: "GET",
			})	
		}),
		getPriority: builder.query<Array<Priority>, string>({
			query: (id) => ({
				url: `${PRIORITY_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { useGetPrioritiesQuery, useGetPriorityQuery } = priorityApi