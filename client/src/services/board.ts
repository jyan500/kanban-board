import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../store" 
import { BACKEND_BASE_URL, BOARD_URL } from "../helpers/urls" 
import { CustomError, Board } from "../types/common" 

export const boardApi = createApi({
	reducerPath: "boardApi",
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
		getBoards: builder.query<Board, void>({
			query: () => ({
				url: BOARD_URL,
				method: "GET",
			})	
		}),
		getBoard: builder.query<Board, void>({
			query: (id) => ({
				url: `${BOARD_URL}/${id}`,
				method: "GET"
			})
		}),
	}),
})

export const { useGetBoardQuery, useGetBoardsQuery } = boardApi 