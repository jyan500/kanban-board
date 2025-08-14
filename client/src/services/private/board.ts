import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	BOARD_URL, 
	BOARD_TICKET_URL, 
	BOARD_STATUS_URL, 
	BOARD_BULK_EDIT_STATUS_URL 
} from "../../helpers/urls" 
import { CustomError, Board, ListResponse, Status, Ticket } from "../../types/common" 
import { privateApi } from "../private"
import { parseURLParams } from "../../helpers/functions" 

type BoardRequest = {
	id?: number
	name: string
	ticketLimit: number
}

type BoardResponse = {
	id: number
	message: string
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
		getBoards: builder.query<ListResponse<Board>, Record<string, any>>({
			query: (urlParams) => ({
				url: `${BOARD_URL}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Boards"]
		}),
		getBoard: builder.query<Array<Board>, {id: number | string, urlParams: Record<string, any>}>({
			query: ({id, urlParams}) => ({
				url: `${BOARD_URL}/${id}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Boards"]
		}),
		addBoard: builder.mutation<BoardResponse, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: BOARD_URL,
				body: {name: board.name, ticket_limit: board.ticketLimit},
				method: "POST",
			}),
			invalidatesTags: ["Boards"]
		}),
		updateBoard: builder.mutation<void, BoardRequest>({
			query: (board: BoardRequest) => ({
				url: `${BOARD_URL}/${board.id}`,
				body: {name: board.name, ticket_limit: board.ticketLimit},
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
		getBoardTickets: builder.query<ListResponse<Ticket>, {id: number, urlParams: Record<string, any>}>({
			query: ({id, urlParams}) => ({
				url: BOARD_TICKET_URL(id, ""),
				method: "GET",
				params: urlParams
			}),
			providesTags: ["BoardTickets"],
			// sort by ticket name
			transformResponse: (response: ListResponse<Ticket>, meta: unknown, arg: Record<string, any>) => {
				if (!arg.urlParams.sortByCreatedAt){
					return {
						data: response.data.sort((a,b) => a.name.localeCompare(b.name)),
						pagination: response.pagination
					}
				}
				return response
			}
		}),
		getBoardStatuses: builder.query<Array<Status>, Record<string, any>>({
			query: (urlParams) => ({
				url: BOARD_STATUS_URL(urlParams.id, ""),
				method: "GET",
				params: urlParams
			}),
			providesTags: ["BoardStatuses"],
		}),
		getBoardStatus: builder.query<Status, {boardId: number, statusId: number}>({
			query: ({boardId, statusId}) => ({
				url: BOARD_STATUS_URL(boardId, statusId),
				method: "GET",
			}),
			providesTags: ["BoardStatuses"]
		}),
		addBoardTickets: builder.mutation<BoardTicketResponse, BoardTicketRequest>({
			query: ({boardId, ticketIds}) => ({
				url: BOARD_TICKET_URL(boardId, ""),
				body: {
					ticket_ids: ticketIds	
				},
				method: "POST",
			}),
			invalidatesTags: ["Boards", "BoardTickets"]
		}),
		addBoardStatuses: builder.mutation<BoardStatusResponse, BoardStatusRequest>({
			query: ({boardId, statusIds}) => ({
				url: BOARD_STATUS_URL(boardId, ""),
				body: {
					status_ids: statusIds
				},
				method: "POST",
			}),
			invalidatesTags: ["Boards", "BoardStatuses"]
		}),
		bulkEditBoardStatuses: builder.mutation<BoardStatusResponse, BoardStatusRequest>({
			query: ({boardId, statusIds}) => ({
				url: BOARD_BULK_EDIT_STATUS_URL(boardId),
				body: {
					status_ids: statusIds
				},
				method: "POST"
			}),
			invalidatesTags: ["Boards", "BoardStatuses"]
		}),
		deleteBoardTicket: builder.mutation<BoardTicketResponse, {boardId: number, ticketId: number}>({
			query: ({boardId, ticketId}) => ({
				url: BOARD_TICKET_URL(boardId, ticketId),
				method: "DELETE"
			}),
			invalidatesTags: ["Boards", "BoardTickets"]	
		}),
		deleteBoardTickets: builder.mutation<BoardTicketResponse, {boardId: number, ticketIds: Array<number>}>({
			query: ({boardId, ticketIds}) => ({
				url: BOARD_TICKET_URL(boardId, ""),
				body: {
					ticket_ids: ticketIds
				},
				method: "DELETE"
			}),
			invalidatesTags: ["Boards", "BoardTickets"]
		}),
		deleteBoardStatus: builder.mutation<BoardStatusResponse, {boardId: number, statusId: number}>({
			query: ({boardId, statusId}) => ({
				url: BOARD_STATUS_URL(boardId, statusId),	
				method: "DELETE"
			}),
			invalidatesTags: ["Boards", "BoardStatuses"]
		}),
		updateBoardStatus: builder.mutation<{message: string}, {boardId: number, statusId: number, limit: number}>({
			query: ({limit, boardId, statusId}) => ({
				url: BOARD_STATUS_URL(boardId, statusId),
				method: "PUT",
				body: {
					limit
				}
			}),
			invalidatesTags: ["Boards", "BoardStatuses"]
		})
	}),
})

export const { 
	useGetBoardQuery, 
	useGetBoardsQuery, 
	useGetBoardTicketsQuery,
	useLazyGetBoardTicketsQuery,
	useGetBoardStatusesQuery,
	useGetBoardStatusQuery,
	useAddBoardMutation,
	useUpdateBoardMutation,
	useAddBoardTicketsMutation,
	useAddBoardStatusesMutation,
	useDeleteBoardTicketMutation,
	useDeleteBoardTicketsMutation,
	useDeleteBoardStatusMutation,
	useUpdateBoardStatusMutation,
	useBulkEditBoardStatusesMutation,
} = boardApi 
