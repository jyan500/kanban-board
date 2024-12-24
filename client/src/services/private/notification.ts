import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { privateApi } from "../private"
import { ListResponse, Notification } from "../../types/common"
import { NOTIFICATION_URL } from "../../helpers/urls"

type NotificationRequest = {
	recipientId: number
	senderId: number
	ticketId?: number
	objectLink: string
	notificationTypeId: number
}

export const notificationApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getNotifications: builder.query<ListResponse<Notification>, Record<string, any>>({
			query: (urlParams) => ({
				url: `${NOTIFICATION_URL}`,
				method: "GET",	
				params: urlParams
			}),
			providesTags: ["Notifications"]
		}),
		pollNotifications: builder.query<Array<Notification>, Record<string, any>>({
			query: (urlParams) => ({
				url: `${NOTIFICATION_URL}/poll`,	
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Notifications"]
		}),
		addNotification: builder.mutation<{message: string}, NotificationRequest>({
			query: ({notificationTypeId, ticketId, objectLink, recipientId, senderId}) => ({
				url: `${NOTIFICATION_URL}`,
				method: "POST",
				body: {
					recipient_id: recipientId,
					sender_id: senderId,
					ticket_id: ticketId,
					object_link: objectLink,
					notification_type_id: notificationTypeId,
				}
			}),
			invalidatesTags: ["Notifications"]
		}),
		updateNotification: builder.mutation<{message: string}, {id: number, isRead: boolean}>({
			query: ({id, isRead}) => ({
				url: `${NOTIFICATION_URL}/${id}`,
				method: "PUT",
				body: {
					is_read: isRead
				}
			}),
			invalidatesTags: ["Notifications"]
		}),
		bulkEditNotifications: builder.mutation<{message: string}, {ids: Array<number>, isRead: boolean}>({
			query: ({ids, isRead}) => ({
				url: `${NOTIFICATION_URL}/bulk-edit`,
				method: "POST",
				body: {
					ids: ids,
					is_read: isRead
				}
			}),
			invalidatesTags: ["Notifications"]
		})
	})
})

export const {
	useGetNotificationsQuery,
	usePollNotificationsQuery,
	useAddNotificationMutation,
	useUpdateNotificationMutation,
	useBulkEditNotificationsMutation,
} = notificationApi
