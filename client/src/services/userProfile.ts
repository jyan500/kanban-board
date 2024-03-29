import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store" 
import { BACKEND_BASE_URL, USER_PROFILE_URL } from "../helpers/urls" 
import { CustomError, UserProfile } from "../types/common" 

export const userProfileApi = createApi({
	reducerPath: "userProfileApi",
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
	        const token = (getState() as RootState).auth.token;
	        if (token) {
		        headers.set('Authorization', `Bearer ${token}`)
	        }
	    
	        return headers
	    },
	}) as BaseQueryFn<string | FetchArgs, unknown, CustomError, {}>,
	endpoints: (builder) => ({
		getUserProfile: builder.query<UserProfile, void>({
			query: () => ({
				url: USER_PROFILE_URL,
				method: "GET",
			})	
		}),
	}),
})

export const { useGetUserProfileQuery } = userProfileApi 