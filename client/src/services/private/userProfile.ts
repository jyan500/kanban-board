import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_PROFILE_URL, USER_PROFILE_ORG_URL, ORG_LOGIN_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserProfile } from "../../types/common" 
import { privateApi } from "../private"
import { UserResponse } from "../public/auth"

type UserProfileRequest = {
	id?: number
	firstName: string
	lastName: string
	email: string
	userRoleId: number
}

type OwnUserProfileRequest = {
	firstName: string	
	lastName: string
	email: string
	password?: string
	changePassword?: boolean
	confirmPassword?: string
	confirmExistingPassword?: string
}

export const userProfileApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getUserProfile: builder.query<UserProfile, void>({
			query: () => ({
				url: `${USER_PROFILE_URL}/me`,
				method: "GET",
			}),
			providesTags: ["userProfiles"]
		}),
		getUser: builder.query<UserProfile, number>({
			query: (userId) => ({
				url: `${USER_PROFILE_URL}/${userId}`,
				method: "GET"
			}),
			providesTags: ["userProfiles"]
		}),
		getUserProfiles: builder.query<ListResponse<UserProfile>, Record<string, any>>({
			query: (urlParams) => ({
				url: USER_PROFILE_URL,	
				method: "GET",
				params: urlParams,
			}),
			providesTags: ["userProfiles"]
		}),
		editUserProfile: builder.mutation<string, UserProfileRequest>({
			query: ({id, firstName, lastName, email, userRoleId}) => ({
				url: `${USER_PROFILE_URL}/${id}`,	
				method: "PUT",
				body: {
					first_name: firstName,
					last_name: lastName,
					email: email,
					user_role_id: userRoleId
				}
			}),
			invalidatesTags: ["userProfiles"]
		}),
		editOwnUserProfile: builder.mutation<string, OwnUserProfileRequest>({
			query: ({firstName, lastName, email, changePassword, password, confirmPassword, confirmExistingPassword}) => ({
				url: `${USER_PROFILE_URL}/me`,
				method: "POST",
				body: {
					first_name: firstName,
					last_name: lastName,
					email: email,
					password: password,
					change_password: changePassword,
					confirm_password: confirmPassword,
					confirm_existing_password: confirmExistingPassword,
				}
			}),
			invalidatesTags: ["userProfiles"]
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
	useEditUserProfileMutation,
	useEditOwnUserProfileMutation,
	useSwitchUserOrganizationMutation 
} = userProfileApi 
