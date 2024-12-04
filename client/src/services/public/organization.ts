import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, ORGANIZATION_URL } from "../../helpers/urls" 
import { CustomError, Organization, ListResponse } from "../../types/common" 
import { publicApi } from "../public" 

export const organizationApi = publicApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getOrganizations: builder.query<ListResponse<Organization>, void>({
			query: () => ({
				url: ORGANIZATION_URL,
				method: "GET",
			})
		}),
		getOrganization: builder.query<Organization, number>({
			query: (id) => ({
				url: `${ORGANIZATION_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { useGetOrganizationsQuery, useGetOrganizationQuery } = organizationApi 
