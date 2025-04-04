import React, {useRef, useState} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { IoMdClose } from "react-icons/io";
import { TICKET_ASSIGNEE_URL, USER_PROFILE_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { GroupBase, SelectInstance } from "react-select"
import { 
	useGetTicketAssigneesQuery,
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation, 
} from "../../services/private/ticket"
import { useAddNotificationMutation } from "../../services/private/notification"
import { OptionType, Toast } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Badge } from "../page-elements/Badge"
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../../helpers/functions"
import { LoadingSpinner } from "../LoadingSpinner"
import { TICKETS } from "../../helpers/routes"
import { LoadingButton } from "../page-elements/LoadingButton"

type Props = {
	ticketId: number | undefined
	ticketAssigneeId: number | undefined
}

type FormValues = {
	userId: number | string
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
	const [ addNotification, {isLoading: isAddNotificationLoading}] = useAddNotificationMutation()
	const selectRef = useRef<SelectInstance<OptionType, false, GroupBase<OptionType>>>(null) 

	const defaultForm = {
		userId: "",
	}

	const registerOptions = {
		userId: { required: "User is required"},
    }

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	const onSubmit = async (values: FormValues) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while linking ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		setSubmitLoading(true)
		if (watchNotificationType && userProfile && ticketId){
	    	try {
		    	await addTicketAssignee({
		    		ticketId: ticketId,
		    		userIds: [Number(values.userId) ?? 0],
		    		isWatcher: true
			    	}).unwrap()
	    		await addNotification({
					recipientId: Number(values.userId) ?? 0,
					senderId: userProfile.id,
					ticketId: ticketId,
					objectLink: `${TICKETS}/${ticketId}`,
					notificationTypeId: watchNotificationType.id,
				}).unwrap()
		    	dispatch(addToast({
		    		...defaultToast,
		    		message: "You are now watching this ticket!",
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
    	// dispatch(toggleShowSecondaryModal(false))
    	// dispatch(setSecondaryModalType(undefined))
    	// dispatch(setSecondaryModalProps({}))
    	// flush cached options after submitting
    	selectRef.current?.clearValue()
    	setCacheKey(uuidv4())
		setSubmitLoading(false)
	}

	const deleteWatcher = async (userId: number) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong when un-watching ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		if (ticketId){
			try {
				await deleteTicketAssignee({ticketId: ticketId, userId: userId, isWatcher: true}).unwrap()
			 	dispatch(addToast({
		    		...defaultToast,
		    		message: "Ticket watcher deleted successfully!",
		    		type: "success"
		    	}))
			}
			catch (e){
				dispatch(addToast(defaultToast))
			}
		}
    	// flush cached options after submitting
    	selectRef.current?.clearValue()
    	setCacheKey(uuidv4())
	}

	return (
		<>
			<div className = "tw-flex tw-flex-col tw-gap-y-4 tw-p-4">
				<p className = "tw-font-bold">Add Watchers</p>		
				{!isTicketWatchersLoading ? (
					<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
						<Controller
							name={"userId"}
							control={control}
			                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncSelect 
				            		ref={selectRef}
				                	endpoint={USER_PROFILE_URL} 
				                	cacheKey={cacheKey}
				                	className={"tw-w-64"}
				                	urlParams={{forSelect: true, excludeUsers: [ticketAssigneeId, ticketWatchers?.map((watcher) => watcher.id)]}} 
				                	onSelect={(selectedOption: {label: string, value: string} | null) => {
				                		onChange(selectedOption?.value ?? "") 	
				                	}}
				                />
			                )}
						/>
						<LoadingButton type="submit" isLoading={submitLoading} text={"Submit"} className = "button"/>
					</form>
				) : null} 
			</div>
			{isTicketWatchersLoading ? <LoadingSpinner/> : (
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					{ ticketWatchers?.filter(watcher => watcher.id !== ticketAssigneeId).map((watcher) => 
						<button onClick={(e) => deleteWatcher(watcher.id)}>
							<Badge className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center tw-justify-between tw-text-white tw-bg-primary">
								<span>{displayUser(watcher)}</span>
								{isDeleteTicketAssigneeLoading ? <LoadingSpinner/> : <IoMdClose className = "icon"/>}
							</Badge>	
						</button>
					)}
				</div>
			)}
		</>
	)		
}
