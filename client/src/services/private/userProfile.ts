import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_PROFILE_URL, USER_PROFILE_ORG_URL, ORG_LOGIN_URL, USER_NOTIFICATION_TYPES_URL, USER_ACTIVATE_ACCOUNT, USER_PROFILE_REGISTRATION_REQUEST_URL } from "../../helpers/urls" 
import { CustomError, ListResponse, Organization, UserRegistrationRequest, UserProfile, UserNotificationType } from "../../types/common" 
import { privateApi } from "../private"
import { UserResponse } from "../public/auth"
import { FormValues as OrganizationFormValues } from "../../components/OrganizationForm"

type UserProfileRequest = {
	id?: number
	firstName: string
	lastName: string
	email: string
	userRoleId: number
}

type OwnUserProfileRequest = {
	firstName?: string	
	lastName?: string
	email?: string
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
			providesTags: ["UserProfiles"]
		}),
		getUser: builder.query<UserProfile, number>({
			query: (userId) => ({
				url: `${USER_PROFILE_URL}/${userId}`,
				method: "GET"
			}),
			providesTags: ["UserProfiles"]
		}),
		getUserProfiles: builder.query<ListResponse<UserProfile>, Record<string, any>>({
			query: (urlParams) => ({
				url: USER_PROFILE_URL,	
				method: "GET",
				params: urlParams,
			}),
			providesTags: ["UserProfiles"]
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
			invalidatesTags: ["UserProfiles"]
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
			invalidatesTags: ["UserProfiles"]
		}),
		getUserOrganizations: builder.query<ListResponse<Organization>, Record<string, any>>({
			query: (urlParams) => ({
				url: USER_PROFILE_ORG_URL,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["UserOrganizations"]
		}),
		switchUserOrganization: builder.mutation<UserResponse, {organizationId: number}>({
			query: ({organizationId}) => ({
				url: ORG_LOGIN_URL,	
				method: "POST",
				body: {organization_id: organizationId}
			})	
		}),
		getUserNotificationTypes: builder.query<Array<UserNotificationType>, void>({
			query: () => ({
				url : `${USER_NOTIFICATION_TYPES_URL}`,
				method: "GET",
			}),
			providesTags: ["UserNotificationTypes"]
		}),
		updateUserNotificationTypes: builder.mutation<{message: string}, {ids: Array<number>}>({
			query: ({ids}) => ({
				url: `${USER_NOTIFICATION_TYPES_URL}`,
				method: "POST",
				body: {
					ids: ids
				}
			}),
			invalidatesTags: ["UserNotificationTypes"]
		}),
		registerOrganization: builder.mutation<{message: string}, OrganizationFormValues>({
			query: ({name, email, address, city, state, zipcode, industry, phoneNumber: phone_number}) => ({
				url: USER_PROFILE_ORG_URL,
				method: "POST",
				body: {
					name, email, address, city, state, zipcode, industry, phone_number
				}
			}),
			invalidatesTags: ["UserOrganizations"]	
		}),
		activateAccount: builder.mutation<{message: string}, void>({
			query: () => ({
				url: USER_ACTIVATE_ACCOUNT,
				method: "POST",
			}),
			invalidatesTags: ["UserProfiles"]
		}),
	}),
})

export const { 
	useGetUserQuery,
	useGetUserProfileQuery, 
	useGetUserProfilesQuery, 
	useLazyGetUserProfilesQuery,
	useGetUserOrganizationsQuery, 
	useEditUserProfileMutation,
	useEditOwnUserProfileMutation,
	useSwitchUserOrganizationMutation,
	useGetUserNotificationTypesQuery,
	useUpdateUserNotificationTypesMutation,
	useRegisterOrganizationMutation,
	useActivateAccountMutation,
} = userProfileApi 
