import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, LOGIN_URL, RESET_PASSWORD_URL, FORGOT_PASSWORD_URL, VALIDATE_TOKEN } from "../../helpers/urls" 
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
		forgotPassword: builder.mutation<{message: string}, {email: string}>({
			query: ({email}) => {
				return {
					url: FORGOT_PASSWORD_URL,
					method: "POST",
					body: {
						email	
					}
				}
			}
		}),
		resetPassword: builder.mutation<{message: string}, {password: string, confirmPassword: string, token: string}>({
			query: ({password, confirmPassword, token}) => {
				return {
					url: RESET_PASSWORD_URL,
					method: "POST",
					body: {
						password,
						confirm_password: confirmPassword,
						token
					}
				}
			}
		}),
		validateToken: builder.query<{token: string}, {token: string, type: string}>({
			query: ({token, type}) => {
				return {
					url: VALIDATE_TOKEN,
					method: "GET",
					params: {
						token,
						type,
					}
				}	
			}
		}),
		protected: builder.mutation<{message: string}, void>({
			query: () => "protected",
		})
	}),
})

export const { 
	useLoginMutation, 
	useForgotPasswordMutation, 
	useResetPasswordMutation, 
	useValidateTokenQuery,
	useProtectedMutation 
} = authApi 
