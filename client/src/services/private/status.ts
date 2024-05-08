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
			})	
		}),
		getStatus: builder.query<Array<Status>, void>({
			query: (id) => ({
				url: `${STATUS_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { useGetStatusQuery, useGetStatusesQuery } = statusApi