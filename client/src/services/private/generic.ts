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
			transformResponse: (responseData: ListResponse<any>, meta: unknown, arg: Record<string, any>) => {
				// for mentions, the list values are different from async select's
				if (arg.urlParams.isMentions){
					return {
						...responseData,
						data: responseData.data.map((d) => ({
							id: d.id,
							value: d.name,
						}))
					}
				}
				return {
					...responseData,
					data: responseData.data.map((d) => ({
						label: d.name,
						value: d.id,
					}))
				}
			}
		}),
		genericImageUpload: builder.mutation<{message: string}, {endpoint: string, id: number, imageUrl: string, invalidatesTags: Array<string>}>({
			query: ({id, endpoint, imageUrl}) => ({
				url: endpoint,
				method: "POST",
				body: {
					id: id,
					image_url: imageUrl
				}
			}),
			invalidatesTags: (result, error, arg) => {
				return arg.invalidatesTags
			}
		})
	})
})

export const {
	useGenericFetchQuery,
	useLazyGenericFetchQuery,
	useGenericImageUploadMutation,
} = genericApi
