import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, ORGANIZATION_URL, USER_REGISTRATION_REQUEST_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserProfile, UserRegistrationRequest } from "../../types/common" 
import { privateApi } from "../private"

interface UpdateOrgRequest {
	id: number
	name: string
	email: string
	address: string
	city: string
	state: string
	phoneNumber: string
	zipcode: string
	industry: string
}

export const organizationApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getRegistrationRequests: builder.query<ListResponse<UserRegistrationRequest>, Record<string,any>>({
			query: (urlParams) => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["RegistrationRequests"]

		}),
		updateRegistrationRequest: builder.mutation<{message: string}, {id: number, approve: boolean}>({
			query: ({id, approve}) => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/${id}`,
				method: "PUT",
				body: {
					approve: approve
				}
			}),
			invalidatesTags: ["RegistrationRequests", "UserProfiles"]
		}),
		bulkEditRegistrationRequests: builder.mutation<{message: string}, {ids: Array<number>, approve: boolean}>({
			query: ({ids, approve}) => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/bulk-edit`,
				method: "POST",
				body: {
					user_registration_request_ids: ids,
					approve: approve
				}
			}),
			invalidatesTags: ["RegistrationRequests", "UserProfiles"]
		}),
		getOrganization: builder.query<Organization, number>({
			query: (id) => ({
				url: `${ORGANIZATION_URL}/${id}`,
				method: "GET"
			}),
			providesTags: ["Organizations"]
		}),
		updateOrganization: builder.mutation<{message: string}, UpdateOrgRequest>({
			query: ({id, name, email, address, city, state, zipcode, industry, phoneNumber}) => ({
				url : `${ORGANIZATION_URL}/${id}`, 
				method: "PUT",
				body: {
					name, email, address, city, state, zipcode, industry, phone_number: phoneNumber
				}
			}),
			invalidatesTags: ["Organizations"]
		})
	}),
})

export const { 
	useGetRegistrationRequestsQuery,
	useUpdateRegistrationRequestMutation,
	useBulkEditRegistrationRequestsMutation,
	useUpdateOrganizationMutation,
	useGetOrganizationQuery,
} = organizationApi 
