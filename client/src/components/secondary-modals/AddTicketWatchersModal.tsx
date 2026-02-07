import React, {useRef, useEffect, useState} from "react"
import { AsyncMultiSelect } from "../AsyncMultiSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { IoMdClose } from "react-icons/io";
import { TICKET_ASSIGNEE_URL, USER_PROFILE_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { GroupBase, SelectInstance, MultiValue } from "react-select"
import { 
	useGetTicketAssigneesQuery,
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation, 
} from "../../services/private/ticket"
import { useBulkCreateNotificationsMutation } from "../../services/private/notification"
import { OptionType, Toast } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Badge } from "../page-elements/Badge"
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../../helpers/functions"
import { LoadingSpinner } from "../LoadingSpinner"
import { TICKETS } from "../../helpers/routes"
import { LoadingButton } from "../page-elements/LoadingButton"
import { PRIMARY_TEXT } from "../../helpers/constants";

type Props = {
	ticketId: number | undefined
	ticketAssigneeId: number | undefined
}

type FormValues = {
	userIdOptions: Array<OptionType>
}

export const AddTicketWatchersModal = ({ticketAssigneeId, ticketId}: Props) => {
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [submitLoading, setSubmitLoading] = useState(false)
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const watchNotificationType = notificationTypes.find((n) => n.name === "Watching Ticket")
	const { data: ticketWatchers, isLoading: isTicketWatchersLoading } = useGetTicketAssigneesQuery(ticketId ? {ticketId: ticketId, params: {isWatcher: true}} : skipToken)
	const [ addTicketAssignee, {isLoading: addTicketAssigneeLoading} ] = useAddTicketAssigneeMutation()
	const [ deleteTicketAssignee, {isLoading: isDeleteTicketAssigneeLoading}] = useDeleteTicketAssigneeMutation()
	const [ bulkCreateNotifications, {isLoading: isAddNotificationLoading}] = useBulkCreateNotificationsMutation()
	const selectRef = useRef<SelectInstance<OptionType, true, GroupBase<OptionType>>>(null) 

	const defaultForm = {
		userIdOptions: [],
	}

	const registerOptions = {
    }

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	useEffect(() => {
		if (ticketWatchers){
			reset({
				userIdOptions: ticketWatchers.map((watcher) => {
					return {
						label: displayUser(watcher),
						value: watcher.id.toString(),
					}
				}) as Array<OptionType>
			})
		}
	}, [isTicketWatchersLoading, ticketWatchers])

	const onSubmit = async (values: FormValues) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while assigning user to the ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		setSubmitLoading(true)
		if (watchNotificationType && userProfile && ticketId){
	    	try {
				const selectedUserIds = values.userIdOptions.map(option => Number(option.value))
				await addTicketAssignee({
					ticketId: ticketId,
					userIds: selectedUserIds,
					isWatcher: true
				}).unwrap()
				await bulkCreateNotifications(
					selectedUserIds.map((userId) => {
					return {
						recipientId: userId,
						senderId: userProfile.id,
						ticketId: ticketId,
						objectLink: `${TICKETS}/${ticketId}`,
						notificationTypeId: watchNotificationType.id,
					}
				})).unwrap()
				dispatch(addToast({
					...defaultToast,
					message: "Watcher(s) added successfully!",
					type: "success"
				}))
	    	}
	    	catch (e){
	    		dispatch(addToast(defaultToast))
	    	}
    	}
    	else {
    		dispatch(addToast(defaultToast))
    	}
    	// flush cached options after submitting
    	// selectRef.current?.clearValue()
    	// setCacheKey(uuidv4())
		setSubmitLoading(false)
	}

	return (
		<>
			<div className = "tw-flex tw-flex-col lg:tw-w-[80%] tw-w-full tw-gap-y-4 tw-p-4">
				<p className = {`${PRIMARY_TEXT} tw-font-bold`}>Add Watchers</p>		
				{!isTicketWatchersLoading ? (
					<>
					<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
						<Controller
							name={"userIdOptions"}
							control={control}
			                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncMultiSelect 
									ref={selectRef}
									endpoint={USER_PROFILE_URL} 
									cacheKey={cacheKey}
									className={"tw-w-full"}
									defaultValue={watch("userIdOptions") ?? null}
									urlParams={{forSelect: true, excludeUsers: [ticketAssigneeId, ticketWatchers?.map((watcher) => watcher.id)]}} 
									onSelect={async (selectedOption: MultiValue<OptionType> | null) => {
										onChange(selectedOption)
									}}
								/>
			                )}
						/>
						<div>
							<LoadingButton type="submit" isLoading={submitLoading} text={"Submit"} className = "button"/>
						</div>
					</form>
					</>
				) : null} 
			</div>
		</>
	)		
}
