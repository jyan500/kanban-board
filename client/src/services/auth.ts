import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, LOGIN_URL } from "../helpers/urls" 
import { CustomError } from "../types/common" 

export interface UserResponse {
	token: string
}

export interface LoginRequest {
	email: string
	password: string
}

export const authApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
	}) as BaseQueryFn<string | FetchArgs, unknown, CustomError, {}>,
	endpoints: (builder) => ({
		login: builder.mutation<UserResponse, LoginRequest>({
			query: (credentials) => ({
				url: LOGIN_URL,
				method: "POST",
				body: credentials
			})	
		}),
		protected: builder.mutation<{message: string}, void>({
			query: () => "protected",
		})
	}),
})

export const { useLoginMutation, useProtectedMutation } = authApi 