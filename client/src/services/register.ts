import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, REGISTER_URL } from "../helpers/urls" 
import { CustomError } from "../types/common" 

export interface Response {
	message: string
}

export interface RegisterRequest {
	firstName: string
	lastName: string
	email: string
	password: string
	confirmPassword: string
}

export const userRegisterApi = createApi({
	reducerPath: "userRegister",
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
	}) as BaseQueryFn<string | FetchArgs, unknown, CustomError, {}>,
	endpoints: (builder) => ({
		userRegister: builder.mutation<Response, RegisterRequest>({
			query: (registrationInfo) => ({
				url: REGISTER_URL,
				method: "POST",
				body: {
					first_name: registrationInfo.firstName,
					last_name: registrationInfo.lastName,
					email: registrationInfo.email,
					password: registrationInfo.password,
					confirm_password: registrationInfo.confirmPassword
				} 
			})	
		}),
	}),
})

export const { useUserRegisterMutation } = userRegisterApi