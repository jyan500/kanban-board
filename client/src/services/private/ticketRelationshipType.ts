import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { BACKEND_BASE_URL, TICKET_RELATIONSHIP_TYPE_URL } from "../../helpers/urls" 
import { CustomError, TicketRelationshipType } from "../../types/common" 
import { privateApi } from "../private"

export const ticketRelationshipTypeApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getTicketRelationshipTypes: builder.query<Array<TicketRelationshipType>, void>({
			query: () => ({
				url: TICKET_RELATIONSHIP_TYPE_URL,
				method: "GET",
			})	
		}),
		getTicketRelationshipType: builder.query<Array<TicketRelationshipType>, string>({
			query: (id) => ({
				url: `${TICKET_RELATIONSHIP_TYPE_URL}/${id}`,
				method: "GET"
			})
		})
	}),
})

export const { 
	useGetTicketRelationshipTypeQuery, 
	useGetTicketRelationshipTypesQuery 
} = ticketRelationshipTypeApi