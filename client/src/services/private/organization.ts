import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_REGISTRATION_REQUEST_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserProfile, UserRegistrationRequest } from "../../types/common" 
import { privateApi } from "../private"

export const organizationApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getRegistrationRequests: builder.query<ListResponse<UserRegistrationRequest>, void>({
			query: () => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/`,
				method: "GET",
			}),
			providesTags: ["RegistrationRequests"]

		}),
		updateRegistrationRequest: builder.mutation<{message: string}, number>({
			query: (id) => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/${id}`,
				method: "PUT"
			}),
			invalidatesTags: ["RegistrationRequests"]
		}),
		bulkEditRegistrationRequests: builder.mutation<{message: string}, Array<number>>({
			query: (ids) => ({
				url: `${USER_REGISTRATION_REQUEST_URL}/bulk-edit`,
				method: "POST",
				body: {
					user_registration_request_ids: ids
				}
			}),
			invalidatesTags: ["RegistrationRequests"]
		})
	}),
})

export const { 
	useGetRegistrationRequestsQuery,
	useUpdateRegistrationRequestMutation,
	useBulkEditRegistrationRequestsMutation,
} = organizationApi 
