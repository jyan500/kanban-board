import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, ORGANIZATION_URL } from "../helpers/urls" 
import { CustomError, Organization } from "../types/common" 

export const organizationApi = createApi({
	reducerPath: "organizationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
	}) as BaseQueryFn<string | FetchArgs, unknown, CustomError, {}>,
	endpoints: (builder) => ({
		getOrganization: builder.query<Array<Organization>, void>({
			query: () => ({
				url: ORGANIZATION_URL,
				method: "GET",
			})	
		}),
	}),
})

export const { useGetOrganizationQuery } = organizationApi 