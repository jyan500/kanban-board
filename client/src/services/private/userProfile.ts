import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_PROFILE_URL } from "../../helpers/urls" 
import { CustomError, UserProfile } from "../../types/common" 
import { privateApi } from "../private"

export const userProfileApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getUserProfile: builder.query<UserProfile, void>({
			query: () => ({
				url: `${USER_PROFILE_URL}/me`,
				method: "GET",
			})	
		}),
		getUserProfiles: builder.query<Array<UserProfile>, void>({
			query: () => ({
				url: USER_PROFILE_URL,	
				method: "GET",
			})
		})
	}),
})

export const { useGetUserProfileQuery, useGetUserProfilesQuery } = userProfileApi 