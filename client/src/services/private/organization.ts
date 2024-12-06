import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_REGISTRATION_REQUEST_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserProfile, UserRegistrationRequest } from "../../types/common" 
import { privateApi } from "../private"

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
		})
	}),
})

export const { 
	useGetRegistrationRequestsQuery,
	useUpdateRegistrationRequestMutation,
	useBulkEditRegistrationRequestsMutation,
} = organizationApi 
