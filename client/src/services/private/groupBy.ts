import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { privateApi } from "../private"
import { GenericObject } from "../../types/common"
import { GROUP_BY_URL } from "../../helpers/urls"

export const groupByApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getGroupByElements: builder.query<Array<GenericObject>, { groupBy: string, ids: Array<string> }>({
			query: ({ groupBy, ids }) => ({
				url: GROUP_BY_URL,
				method: "GET",	
				params: {
					query: groupBy,
					ids: ids,
				}
			})
		}),
	})
})

export const {
	useGetGroupByElementsQuery,
} = groupByApi
