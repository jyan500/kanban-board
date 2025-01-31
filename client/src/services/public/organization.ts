import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, ORGANIZATION_URL } from "../../helpers/urls" 
import { CustomError, Organization, ListResponse } from "../../types/common" 
import { publicApi } from "../public" 

type OrgRequest = {
	name: string
	email: string
	address: string
	city: string
	state: string
	phoneNumber: string
	zipcode: string
	industry: string
}

export const organizationApi = publicApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getOrganizations: builder.query<ListResponse<Organization>, void>({
			query: () => ({
				url: ORGANIZATION_URL,
				method: "GET",
			}),
		}),
		addOrganization: builder.mutation<{id: number, message: string}, OrgRequest>({
			query: () => ({
				url: ORGANIZATION_URL,
				method: "POST"	
			})	
		})
	}),
})

export const { useGetOrganizationsQuery, useAddOrganizationMutation } = organizationApi 
