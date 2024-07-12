import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, USER_ROLE_URL } from "../../helpers/urls" 
import { CustomError, UserRole } from "../../types/common" 
import { privateApi } from "../private"

export const userRoleApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getUserRoles: builder.query<Array<UserRole>, void>({
			query: () => ({
				url: USER_ROLE_URL,	
				method: "GET",
			})
		})
	}),
})

export const { useGetUserRolesQuery } = userRoleApi 