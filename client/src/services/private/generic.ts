import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { privateApi } from "../private"
import { ListResponse } from "../../types/common"

export const genericApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		genericFetch: builder.query<ListResponse<any>, { endpoint: string, urlParams: Record<string, any>}>({
			query: ({ endpoint, urlParams}) => ({
				url: endpoint,
				method: "GET",	
				params: urlParams
			}),
			transformResponse: (responseData: ListResponse<any>) => {
				return {
					...responseData,
					data: responseData.data.map((d) => ({
						label: d.name,
						value: d.id,
					}))
				}
			}
		})
	})
})

export const {
	useGenericFetchQuery
} = genericApi
