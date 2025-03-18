import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal, setModalType, setModalProps } from "../slices/modalSlice" 
import { Controller, useForm, FormProvider } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { Mention, UserProfile, Status, Ticket, TicketType, Priority, OptionType } from "../types/common"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../services/private/board"
import { 
	useAddTicketMutation, 
	useDeleteTicketMutation, 
	useBulkEditTicketAssigneesMutation,
	useBulkEditTicketsMutation,
} 
from "../services/private/ticket"
import { TICKETS } from "../helpers/routes" 
import { useAddNotificationMutation, useBulkCreateNotificationsMutation } from "../services/private/notification"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"
import { addToast } from "../slices/toastSlice" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "./LoadingSpinner"
import { USER_PROFILE_URL } from "../helpers/urls"
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { IconContext } from "react-icons"
import { LoadingButton } from "./page-elements/LoadingButton"
import { AsyncSelect } from "./AsyncSelect"
import { SimpleEditor } from "./page-elements/SimpleEditor"

export type FormCommon = {
	id?: number
	name: string
	description: string 
	priorityId: number
	statusId: number
	ticketTypeId: number
}

export type FormValues = FormCommon & {
	userId: number 
}

export type AddTicketFormValues = FormCommon & {
	userIdOption: OptionType
}

type Props = {
	boardId?: number | null | undefined
	ticket?: Ticket | null | undefined
	statusId?: number | null | undefined
	statusesToDisplay?: Array<Status>
	isBulkAction?: boolean
	title?: string
	buttonBar?: React.ReactNode
	onSubmit?: (values: AddTicketFormValues) => void
	formValues?: AddTicketFormValues
	step?: number
}

export const AddTicketForm = ({boardId, ticket, statusesToDisplay, statusId, isBulkAction, title, buttonBar, step, formValues, onSubmit: propsOnSubmit}: Props) => {
	const dispatch = useAppDispatch()
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	// only run query if currentTicketId is not null, otherwise it will pass in the skipToken,
	// which notifies RTK query to skip this 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ deleteTicket, {isLoading: isDeleteTicketLoading, error: isDeleteTicketError} ] = useDeleteTicketMutation()
	const [ addBoardTickets, {isLoading: isAddBoardTicketsLoading, error: isAddBoardTicketsError} ] = useAddBoardTicketsMutation() 
	const [ deleteBoardTicket, {isLoading: isDeleteBoardTicketLoading, error: isDeleteBoardTicketError}] = useDeleteBoardTicketMutation()
	const [ bulkCreateNotifications, {isLoading: isBulkCreateNotificationLoading}] = useBulkCreateNotificationsMutation()
	const defaultForm: AddTicketFormValues = {
		id: undefined,
		name: "",
		ticketTypeId: 0,
		description: "",
		priorityId: 0,
		statusId: statusId ?? 0,
		userIdOption: {value: "", label: ""}
	}
	const [preloadedValues, setPreloadedValues] = useState<AddTicketFormValues>(defaultForm)
	const methods = useForm<AddTicketFormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , control, setValue, getValues, watch, formState: {errors} } = methods

	const adminRole = userRoles?.find((role) => role.name === "ADMIN")
	const boardAdminRole = userRoles?.find((role) => role.name === "BOARD_ADMIN")
	const epicTicketType = ticketTypes?.find((ticketType) => ticketType?.name === "Epic")
	const mentionNotificationType = notificationTypes?.find((notificationType) => notificationType?.name === "Mention")

	const registerOptions = {
		...(!isBulkAction ? {
		    name: { required: "Name is required" },
			description: { required: "Description is required"},
		    ticketTypeId: { required: "Ticket Type is required"},
		    priorityId: { required: "Priority is required"},
		    statusId: { required: "Status is required"},
		} : {}),
	    userIdOption: {},
    }

	useEffect(() => {
		// initialize with current values if the ticket exists
		if (ticket){
			reset({
				...ticket, 
				id: undefined,
				userIdOption: {label: "", value: ""}
			})
		}
		else {
			reset(defaultForm)
		}
	}, [ticket])

	useEffect(() => {
		if (formValues){
			reset(formValues)
		}
	}, [formValues])

    const onSubmit = async (values: AddTicketFormValues) => {
    	try {
    		const assigneeId = !isNaN(Number(values.userIdOption.value)) ? Number(values.userIdOption.value) : 0
	    	const {id: insertedTicketId, mentions} = await addTicket({
	    		...values, 
	    		// this value is unused, just for typescript purposes
	    		userId: assigneeId,
	    		description: values.description
	    	}).unwrap()
			if (mentionNotificationType && userProfile && mentions.length){
    			const notifications = mentions.map((mention: Mention) => {
    				return {
						recipientId: mention.userId,
						senderId: userProfile.id,
						ticketId: mention.ticketId,
						objectLink: `${TICKETS}/${mention.ticketId}`,
						notificationTypeId: mentionNotificationType.id,
					}
    			})
				await bulkCreateNotifications(notifications).unwrap()
			}
	    	if (boardId){
		    	await addBoardTickets({boardId: boardId, ticketIds: [insertedTicketId]}).unwrap()
	    	}
	    	// update ticket assignees
	    	if (assigneeId){
	    		await bulkEditTicketAssignees({ticketId: insertedTicketId, isWatcher: false, userIds: [assigneeId]}).unwrap()
	    	}
			dispatch(toggleShowModal(false))
			dispatch(setModalType(undefined))
			dispatch(setModalProps({}))
			dispatch(selectCurrentTicketId(null))
			dispatch(toggleShowSecondaryModal(false))
			dispatch(setSecondaryModalProps({}))
			dispatch(setSecondaryModalType(undefined))
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added successfully!`,
    		}))
    	}
    	catch (e) { 
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: "Failed to submit ticket",
    		}))
    	}
    }

	return (
		<div className = "tw-flex tw-flex-col lg:tw-w-[500px]">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(propsOnSubmit ?? onSubmit)}>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{title ? <p className = "tw-font-bold">{title}</p> : null}
						{
							isBulkAction ? <span className = "tw-text-xs tw-font-semibold">Fill out the fields that you would like to update across all the selected tickets. Blank fields will be unchanged on the selected tickets.</span> : null
						}
						{
							!isBulkAction ? (
								<div>
									<label className = "label" htmlFor="ticket-name">Name</label>
									<input className = "tw-w-full" id = "ticket-name" type = "text"
									{...register("name", registerOptions.name)}
									/>
							        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
								</div>
							) : null
						}
						<div>
							<label className = "label" htmlFor = "ticket-status">Status</label>
							<select className = "tw-w-full" id = "ticket-status" {...register("statusId", registerOptions.statusId)}>
								{statusesToDisplay?.map((status: Status) => {
									return <option key = {status.id} value = {status.id}>{status.name}</option>
								})}
							</select>	
					        {errors?.statusId && <small className = "--text-alert">{errors.statusId.message}</small>}
						</div>
						{
							!isBulkAction ? (
								<div>
									<label className = "label" htmlFor = "ticket-description">Description</label>
									<SimpleEditor
										registerField={"description"}
										registerOptions={registerOptions.description}
										mentionsEnabled={true}
									/>
							        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
							    </div>
							) : null
						}
					    <div>
							<label className = "label" htmlFor = "ticket-assignee">Assignee</label>
							<Controller
								name={"userIdOption"}
								control={control}
				                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncSelect 
			                		defaultValue={formValues?.userIdOption ?? {label: "", value: "'"}}
				                	endpoint={USER_PROFILE_URL} 
				                	urlParams={{forSelect: true}} 
				                	className={"tw-w-full"}
				                	onSelect={(selectedOption: {label: string, value: string} | null) => {
				                		onChange(selectedOption) 	
				                	}}
				                />
			                )}
							/>
					        {errors?.userIdOption && <small className = "--text-alert">{errors.userIdOption.message}</small>}
						</div>
						<div>
							<label className = "label" htmlFor = "ticket-priority">Priority</label>
							<select className = "tw-w-full" id = "ticket-priority" {...register("priorityId", registerOptions.priorityId)}>
								{priorities.map((priority: Priority) => {
									return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
								})}
							</select>
					        {errors?.priorityId && <small className = "--text-alert">{errors.priorityId.message}</small>}
						</div>
						{
							!isBulkAction ? (
								<div className = "tw-space-y-2">
									<>
										<label className = "label" htmlFor = "ticket-type">Ticket Type</label>
										<select className = "tw-w-full" id = "ticket-type" {...register("ticketTypeId", registerOptions.ticketTypeId)}>
											{ticketTypes.map((ticketType: TicketType) => {
												return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
											})}
										</select>
									</>
							        {errors?.ticketTypeId && <small className = "--text-alert">{errors.ticketTypeId.message}</small>}
							        {
							        	watch("ticketTypeId") == epicTicketType?.id ? (
									        <div className = "tw-flex tw-flex tw-items-center tw-gap-x-2">
										        <IconContext.Provider value={{color: "var(--bs-warning)"}}>
													<WarningIcon className = "tw-h-6 tw-w-6"/>
												</IconContext.Provider>
												<span className = "tw-font-semibold">If the ticket type is "Epic", it cannot changed once saved.</span>
											</div>
							        	) : null
							        }
								</div>	
							) : null
						}
						{
							buttonBar ? buttonBar : (
								<div>
									<LoadingButton type="submit" className = "button" text={"Submit"}></LoadingButton>
								</div>
							)
						}
					</div>
				</form>
			</FormProvider>
		</div>
	)	
}
