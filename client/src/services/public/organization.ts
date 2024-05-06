import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, ORGANIZATION_URL } from "../../helpers/urls" 
import { CustomError, Organization } from "../../types/common" 
import { publicApi } from "../public" 

export const organizationApi = publicApi.injectEndpoints({
	overrideExisting: false,
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