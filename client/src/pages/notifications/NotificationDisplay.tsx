import React, { useState } from "react"
import { useAppDispatch } from "../../hooks/redux-hooks"
import { notificationApi, useGetNotificationsQuery } from "../../services/private/notification" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Notification, Toast } from "../../types/common"
import { NOTIFICATIONS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { SearchToolBar } from "../../components/tickets/SearchToolBar"
import { useForm, FormProvider } from "react-hook-form"
import { withUrlParams } from "../../helpers/functions"
import { Filters } from "../../components/notifications/Filters"
import { Avatar } from "../../components/page-elements/Avatar"
import { NotificationRow } from "../../components/notifications/NotificationRow"
import { Link } from "react-router-dom"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { 
	useUpdateNotificationMutation,
	useBulkEditNotificationsMutation, 
} from "../../services/private/notification"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"

export type Filters = {
	notificationType: string
	user: string
	dateFrom: string 
	dateTo: string
	isUnread: string
}

export type FormValues = Filters & {
	searchBy: string
	query: string	
}

type StateSearchParams = FormValues & {
	page: number | string 
}

export const NotificationDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [ selectedIds, setSelectedIds ] = useState<Array<number>>([])
	const [ bulkEditNotifications, { error: bulkEditNotificationsError, isLoading: isBulkEditNotificationsLoading }] = useBulkEditNotificationsMutation()
    const [ updateNotification, {error: updateNotificationError, isLoading: isUpdateNotificationLoading}] = useUpdateNotificationMutation()
	const filters: Filters = {
		"notificationType": searchParams.get("notificationType") ?? "",
		"user": searchParams.get("user") ?? "",
		"dateFrom": searchParams.get("dateFrom") ?? "",
		"dateTo": searchParams.get("dateTo") ?? "",
		"isUnread": searchParams.get("isUnread") ?? "",
	}
	const {data: data, isFetching, isLoading } = useGetNotificationsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1,
		perPage: 30,
		...filters
	})
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const url = NOTIFICATIONS
	const defaultForm: FormValues = {
		query: searchParams.get("query") ?? "",
		searchBy: searchParams.get("searchBy") ?? "title",
		...filters
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const registerOptions = {
	}

	// TODO: unsure if this functionality should be on this page
	const markMessagesRead = async (notificationIds: Array<number>) => {
		const defaultToast: Toast  = {
			id: uuidv4(),	
			message: "Failed to mark notifications as read.",
			animationType: "animation-in",
			type: "failure"
		}
		if (notificationIds?.length){
			try {
				await bulkEditNotifications({isRead: true, ids: notificationIds}).unwrap()
				dispatch(addToast({
					...defaultToast, 
					message: `${selectedIds.length} notifications marked as read!`,
					type: "success"
				}))

			}
			catch (err){
				dispatch(addToast(defaultToast))
			}
		}		
	}

	const markMessageRead = async (message: Notification) => {
		try {
			await updateNotification({isRead: true, id: message.id}).unwrap()
		}
		catch {
			dispatch(addToast({
				id: uuidv4(),
				message: "Failed to mark notification as read.",
				animationType: "animation-in",
				type: "failure"
			}))	
		}
	}

	const groupedByDate = (notifications: Array<Notification> | undefined) => {
		const groupedBy: Record<string, Array<Notification>> = {}
		notifications?.forEach((notification) => {
			const createdAt = new Date(notification.createdAt)
			const key = createdAt.toLocaleDateString()
			if (key in groupedBy){
				groupedBy[key as keyof typeof groupedBy].push(notification)
			}
			else {
				groupedBy[key as keyof typeof groupedBy] = [notification]
			}
		})
		return groupedBy
	}

	const onSubmit = (values: FormValues) => {
		const parsedValues = Object.fromEntries(
			Object.entries(values).map(([key, value]) => [key, value === null ? "" : value])
		) as FormValues
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams({
			page: "1",
			...parsedValues
		})
	}

	const setPage = (pageNum: number) => {
		let pageUrl = `${NOTIFICATIONS}?page=${pageNum}`
		pageUrl = withUrlParams(defaultForm, searchParams, pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	const renderFilter = () => {
		return (
			<Filters/>
		)
	}

	const setSelectedId = (selectedId: number) => {
		if (selectedIds.includes(selectedId)){
			setSelectedIds(selectedIds.filter(id => id !== selectedId))	
		}
		else {
			setSelectedIds([...selectedIds, selectedId])
		}
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<h1>Notifications</h1>
			<FormProvider {...methods}>
				<SearchToolBar 
					paginationData={data?.pagination} 
					setPage={setPage} 
					currentPage={currentPage ?? 1}
					registerOptions={registerOptions}
					onFormSubmit={async () => {
						await handleSubmit(onSubmit)()
					}}
					renderFilter={renderFilter}
					showFilters={!(Object.values(filters).every((val: string) => val === "" || val == null))}
					filters={Object.keys(filters)}
					hidePagination={true}
				/>
			</FormProvider>
			{isLoading ? (
				<LoadingSkeleton width="tw-w-full" height="tw-h-84">
					<RowPlaceholder/>
				</LoadingSkeleton>
			) : (
				<>
					{
						selectedIds.length > 0 ? 	
						<BulkEditToolbar
							applyActionToAll={async () => {
								await markMessagesRead(selectedIds)
								setSelectedIds([])
							}}
							updateIds={setSelectedIds}
							actionText={"Mark as Read"}
							itemIds={selectedIds}
						/> : null
					}
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{Object.entries(groupedByDate(data?.data)).map(([key, value]) => {
							return (
								<div className = "tw-flex tw-flex-col tw-gap-y-2" key = {key}>
									<p className = "tw-font-bold">{key}</p>
									<div className = "tw-flex tw-flex-col tw-gap-y-.5">
										{
											value.map((notification) => {
												return (
													<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-4">
														<input checked={selectedIds.includes(notification.id)} onClick={() => setSelectedId(notification.id)} type="checkbox"/>
														<Link 
															className = "tw-w-full"
															onClick={async () => {
																if (!notification.isRead){
																	await markMessageRead(notification)}
																}
															}
															to = {notification.objectLink} key = {`notification_${notification.id}`}><NotificationRow notification={notification}/></Link>
													</div>
												)
											})
										}
									</div>
								</div>
							)
						})}
					</div>
					<div className = "tw-p-4 tw-border tw-border-gray-300">
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setPage}	
							paginationData={data?.pagination}
							currentPage={currentPage}
							urlParams={defaultForm}
							url={`${NOTIFICATIONS}`}	
						/>
					</div>
				</>
			)}
		</div>
	)	
}
