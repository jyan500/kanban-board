import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, LOGIN_URL } from "../../helpers/urls" 
import { CustomError } from "../../types/common" 
import { publicApi } from "../public" 

export interface UserResponse {
	token: string
}

export interface LoginRequest {
	email: string
	password: string
	organizationId: number
}

export const authApi = publicApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		login: builder.mutation<UserResponse, LoginRequest>({
			query: (credentials) => ({
				url: LOGIN_URL,
				method: "POST",
				body: {
					email: credentials.email,
					password: credentials.password,
					organization_id: credentials.organizationId,
				}
			})	
		}),
		protected: builder.mutation<{message: string}, void>({
			query: () => "protected",
		})
	}),
})

export const { useLoginMutation, useProtectedMutation } = authApi 