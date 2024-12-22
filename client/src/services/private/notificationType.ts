import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { privateApi } from "../private"
import { ListResponse, NotificationType } from "../../types/common"
import { NOTIFICATION_TYPE_URL } from "../../helpers/urls"

export const notificationApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getNotificationTypes: builder.query<Array<NotificationType>, void>({
			query: () => ({
				url: `${NOTIFICATION_TYPE_URL}`,
				method: "GET",	
			}),
		}),
	})
})

export const {
	useGetNotificationTypesQuery,
} = notificationApi
