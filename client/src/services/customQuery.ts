import { fetchBaseQuery } from "@reduxjs/toolkit/query"
import type {
	BaseQueryFn,	
	FetchArgs,
	FetchBaseQueryError
} from "@reduxjs/toolkit/query"
import { logout } from "../slices/authSlice" 
import { CustomError } from "../types/common"
import { BACKEND_BASE_URL } from "../helpers/urls" 
import { RootState } from "../store" 
import { v4 as uuidv4 } from "uuid" 

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, {}>
 =
async (args, api, extraOptions) => {
	let result = await fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
	        const token = (getState() as RootState).auth.token;
	        if (token) {
		        headers.set('Authorization', `Bearer ${token}`)
	        }
	        return headers
	    }})(args, api, extraOptions)	
	if (result.error){
		if (result.error.status === 403) {
			// TODO: implement refresh token
			api.dispatch(logout())
		}
	}
	return result
}
