import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	BOARD_URL, 
	BOARD_TICKET_URL, 
	BOARD_STATUS_URL, 
	BOARD_BULK_EDIT_STATUS_URL 
} from "../../helpers/urls" 
import { CustomError, Board, Status, Ticket } from "../../types/common" 
import { privateApi } from "../private"
import { parseURLParams } from "../../helpers/functions" 

type BoardRequest = {
	id?: number
	name: string
}

type BoardTicketRequest = {
	boardId: number
	ticketIds: Array<number>
}

type BoardTicketResponse = {
	message: string
}

type BoardStatusRequest = {
	boardId: number
	statusIds: Array<number>
}

type BoardStatusResponse = {
	message: string
}

export const boardApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getBoards: builder.query<Array<Board>, Record<string, any>>({
			query: (urlParams) => ({
				url: `${BOARD_URL}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Boards"]
		}),
		getBoard: builder.query<Array<Board>, string>({
			query: (id) => ({
				url: `${BOARD_URL}/${id}`,
				method: "GET",
			}),
			providesTags: ["Boards"]
		}),
		createBoard: builder.mutation<void, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: BOARD_URL,
				method: "POST",
			}),
			invalidatesTags: ["Boards"]
		}),
		updateBoard: builder.mutation<void, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: `${BOARD_URL}/${board.id}`,
				method: "PUT",
			}),
			invalidatesTags: ["Boards"]
		}),
		deleteBoard: builder.mutation<void, number>({
			query: (id) => ({
				url: `${BOARD_URL}/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Boards"]
		}),
		getBoardTickets: builder.query<Array<Ticket>, string>({
			query: (id) => ({
				url: BOARD_TICKET_URL(id, ""),
				method: "GET",
			}),
			providesTags: ["BoardTickets"]
		}),
		getBoardStatuses: builder.query<Array<Status>, string>({
			query: (id) => ({
				url: BOARD_STATUS_URL(id, ""),
				method: "GET",
			}),
			providesTags: ["BoardStatuses"],
		}),
		addBoardTickets: builder.mutation<BoardTicketResponse, BoardTicketRequest>({
			query: ({boardId, ticketIds}) => ({
				url: BOARD_TICKET_URL(boardId, ""),
				body: {
					ticket_ids: ticketIds	
				},
				method: "POST",
			}),
			invalidatesTags: ["BoardTickets"]
		}),
		addBoardStatuses: builder.mutation<BoardStatusResponse, BoardStatusRequest>({
			query: ({boardId, statusIds}) => ({
				url: BOARD_STATUS_URL(boardId, ""),
				body: {
					status_ids: statusIds
				},
				method: "POST",
			}),
			invalidatesTags: ["BoardStatuses"]
		}),
		bulkEditBoardStatuses: builder.mutation<BoardStatusResponse, BoardStatusRequest>({
			query: ({boardId, statusIds}) => ({
				url: BOARD_BULK_EDIT_STATUS_URL(boardId),
				body: {
					status_ids: statusIds
				},
				method: "POST"
			}),
			invalidatesTags: ["BoardStatuses"]
		}),
		deleteBoardTicket: builder.mutation<BoardTicketResponse, {boardId: number, ticketId: number}>({
			query: ({boardId, ticketId}) => ({
				url: BOARD_TICKET_URL(boardId, ticketId),
				method: "DELETE"
			}),
			invalidatesTags: ["BoardTickets"]	
		}),
		deleteBoardStatus: builder.mutation<BoardStatusResponse, {boardId: number, statusId: number}>({
			query: ({boardId, statusId}) => ({
				url: BOARD_STATUS_URL(boardId, statusId),	
				method: "DELETE"
			}),
			invalidatesTags: ["BoardStatuses"]
		})
	}),
})

export const { 
	useGetBoardQuery, 
	useGetBoardsQuery, 
	useGetBoardTicketsQuery,
	useGetBoardStatusesQuery,
	useAddBoardTicketsMutation,
	useAddBoardStatusesMutation,
	useDeleteBoardTicketMutation,
	useDeleteBoardStatusMutation,
	useBulkEditBoardStatusesMutation,
} = boardApi 