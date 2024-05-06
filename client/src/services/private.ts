import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store" 
import { BACKEND_BASE_URL } from "../helpers/urls" 
import { CustomError, Board, Ticket } from "../types/common" 

// initialize an empty api service that we'll inject endpoints into later as needed
export const privateApi = createApi({
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
	tagTypes: ["Boards", "BoardTickets"],
	endpoints: () => ({}),
})