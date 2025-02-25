import React, { useState } from "react"
import { useAppDispatch } from "../../hooks/redux-hooks"
import { useGetNotificationsQuery } from "../../services/private/notification" 
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

export type Filters = {
	notificationType: string
	user: string
	dateFrom: string 
	dateTo: string
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
	const [ bulkEditNotifications, { error: bulkEditNotificationsError, isLoading: isBulkEditNotificationsLoading }] = useBulkEditNotificationsMutation()
    const [ updateNotification, {error: updateNotificationError, isLoading: isUpdateNotificationLoading}] = useUpdateNotificationMutation()
	const filters: Filters = {
		"notificationType": searchParams.get("notificationType") ?? "",
		"user": searchParams.get("user") ?? "",
		"dateFrom": searchParams.get("dateFrom") ?? "",
		"dateTo": searchParams.get("dateTo") ?? "",
	}
	const {data: data, isFetching } = useGetNotificationsQuery({
		searchBy: searchParams.get("searchBy") ?? "",
		query: searchParams.get("query") ?? "",
		page: searchParams.get("page") ?? 1,
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
		searchBy: {"required": "Search By is Required"},
		query: {"validate": (value: string) => {
			const allFilters = Object.keys(filters).map((filter: string) => watch(filter as keyof Filters))
			if (value === "" && allFilters.every((val: string) => val === "")){
				return "Search Query is required"
			}
			return true
		}},
	}

	// TODO: unsure if this functionality should be on this page
	// const markMessagesRead = async (messages: Array<Notification>) => {
	// 	if (messages?.length){
	// 		try {
	// 			await bulkEditNotifications({isRead: true, ids: messages?.map((n) => n.id) ?? []}).unwrap()
	// 		}
	// 		catch (err){
	// 			dispatch(addToast({
	// 				id: uuidv4(),
	// 				message: "Failed to mark notifications as read.",
	// 				animationType: "animation-in",
	// 				type: "failure"
	// 			}))
	// 		}
	// 	}		
	// }

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
		// reset back to page 1 if modifying search results
		// setting the search params 
		// modifying the search params will then retrigger the useGetTicketsQuery
		setSearchParams({
			page: "1",
			...values
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
				/>
			</FormProvider>
			{isFetching ? <LoadingSpinner/> : (
				<>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{Object.entries(groupedByDate(data?.data)).map(([key, value]) => {
							return (
								<div className = "tw-flex tw-flex-col tw-gap-y-2" key = {key}>
									<p className = "tw-font-bold">{key}</p>
									<div className = "tw-flex tw-flex-col tw-gap-y-.5">
										{
											value.map((notification) => {
												return (
													<Link 
														onClick={async () => {
															if (!notification.isRead){
																await markMessageRead(notification)}
															}
														}
														to = {notification.objectLink} key = {`notification_${notification.id}`}><NotificationRow notification={notification}/></Link>
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
