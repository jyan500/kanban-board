import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, BOARD_URL, BOARD_TICKET_URL } from "../../helpers/urls" 
import { CustomError, Board, Ticket } from "../../types/common" 
import { privateApi } from "../private"

type BoardRequest = {
	id?: number
	name: string
}

export const boardApi = privateApi.injectEndpoints({
	// reducerPath: "boardApi",
	// tagTypes: ["Boards", "BoardTickets"],
	overrideExisting: false,
	endpoints: (builder) => ({
		getBoards: builder.query<Array<Board>, void>({
			query: () => ({
				url: BOARD_URL,
				method: "GET",
				providesTags: ["Boards"]
			})	
		}),
		getBoard: builder.query<Array<Board>, string>({
			query: (id) => ({
				url: `${BOARD_URL}/${id}`,
				method: "GET",
				providesTags: ["Boards"]
			})
		}),
		createBoard: builder.mutation<void, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: BOARD_URL,
				method: "POST",
				invalidatesTags: ["Boards"]
			})
		}),
		updateBoard: builder.mutation<void, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: `${BOARD_URL}/${board.id}`,
				method: "PUT",
				invalidatesTags: ["Boards"]
			})
		}),
		deleteBoard: builder.mutation<void, number>({
			query: (id) => ({
				url: `${BOARD_URL}/${id}`,
				method: "DELETE",
				invalidatesTags: ["Boards"]
			})
		}),
		getBoardTickets: builder.query<Array<Ticket>, string>({
			query: (id) => ({
				url: BOARD_TICKET_URL(id),
				method: "GET"
			})
		})
	}),
})

export const { useGetBoardQuery, useGetBoardsQuery, useGetBoardTicketsQuery } = boardApi 