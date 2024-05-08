import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, TICKET_TYPE_URL } from "../../helpers/urls" 
import { CustomError, TicketType } from "../../types/common" 
import { privateApi } from "../private"

export const ticketTypeApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getTicketTypes: builder.query<Array<TicketType>, void>({
			query: () => ({
				url: TICKET_TYPE_URL,
				method: "GET",
			})	
		}),
		getTicketType: builder.query<Array<TicketType>, string>({
			query: (id) => ({
				url: `${TICKET_TYPE_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { useGetTicketTypeQuery, useGetTicketTypesQuery } = ticketTypeApi