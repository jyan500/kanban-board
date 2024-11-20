import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_PROFILE_URL, USER_PROFILE_ORG_URL, ORG_LOGIN_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserProfile } from "../../types/common" 
import { privateApi } from "../private"
import { UserResponse } from "../public/auth"

export const userProfileApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getUserProfile: builder.query<UserProfile, void>({
			query: () => ({
				url: `${USER_PROFILE_URL}/me`,
				method: "GET",
			})	
		}),
		getUser: builder.query<UserProfile, number>({
			query: (userId) => ({
				url: `${USER_PROFILE_URL}/${userId}`,
				method: "GET"
			})
		}),
		getUserProfiles: builder.query<ListResponse<UserProfile>, Record<string, any>>({
			query: (urlParams) => ({
				url: USER_PROFILE_URL,	
				method: "GET",
				params: urlParams,
			})
		}),
		getUserOrganizations: builder.query<ListResponse<Organization>, Record<string, any>>({
			query: (urlParams) => ({
				url: `${USER_PROFILE_ORG_URL}`,
				method: "GET",
				params: urlParams
			})
		}),
		switchUserOrganization: builder.mutation<UserResponse, {organizationId: number}>({
			query: ({organizationId}) => ({
				url: ORG_LOGIN_URL,	
				method: "POST",
				body: {organization_id: organizationId}
			})	
		})	
	}),
})

export const { 
	useGetUserQuery,
	useGetUserProfileQuery, 
	useGetUserProfilesQuery, 
	useGetUserOrganizationsQuery, 
	useSwitchUserOrganizationMutation 
} = userProfileApi 
