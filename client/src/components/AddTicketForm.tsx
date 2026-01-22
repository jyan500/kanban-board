import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal, setModalType, setModalProps } from "../slices/modalSlice" 
import { Controller, useForm, FormProvider } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { Mention, UserProfile, Status, Ticket, TicketType, Priority, OptionType } from "../types/common"
import { useAddBoardTicketsMutation } from "../services/private/board"
import { 
	useAddTicketMutation, 
	useBulkEditTicketAssigneesMutation,
	useBulkEditTicketsMutation,
} 
from "../services/private/ticket"
import { useUpdateSprintTicketsMutation } from "../services/private/sprint"
import { TICKETS } from "../helpers/routes" 
import { useAddNotificationMutation, useBulkCreateNotificationsMutation } from "../services/private/notification"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"
import { addToast } from "../slices/toastSlice" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "./LoadingSpinner"
import { USER_PROFILE_URL } from "../helpers/urls"
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"
import { IconWarning } from "./icons/IconWarning"
import { IconContext } from "react-icons"
import { LoadingButton } from "./page-elements/LoadingButton"
import { AsyncSelect } from "./AsyncSelect"
import { Select } from "./page-elements/Select"
import { SimpleEditor } from "./page-elements/SimpleEditor"

export type FormCommon = {
	id?: number
	name: string
	description: string 
	priorityId: OptionType 
	statusId: number
	ticketTypeId: OptionType
}

export type FormValues = FormCommon & {
	userIdOption: OptionType | null
}

export type AddTicketFormValues = FormCommon & FormValues

type Props = {
	boardId?: number | null | undefined
	ticket?: Ticket | null | undefined
	statusId?: number | null | undefined
	dueDate?: string | null | undefined
	sprintId?: number | null | undefined
	statusesToDisplay?: Array<Status>
	isBulkAction?: boolean
	title?: string
	buttonBar?: React.ReactNode
	onSubmit?: (values: AddTicketFormValues) => void
	formValues?: AddTicketFormValues
	step?: number
}

export const AddTicketForm = ({
	boardId, 
	ticket, 
	dueDate,
	statusesToDisplay, 
	statusId,
	sprintId, 
	isBulkAction,
	title, 
	buttonBar, 
	step, 
	formValues, 
	onSubmit: propsOnSubmit
}: Props) => {
	const dispatch = useAppDispatch()
	const { priorities, prioritiesForSelect } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes, ticketTypesForSelect } = useAppSelector((state) => state.ticketType)
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	// only run query if currentTicketId is not null, otherwise it will pass in the skipToken,
	// which notifies RTK query to skip this 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ addBoardTickets, {isLoading: isAddBoardTicketsLoading, error: isAddBoardTicketsError} ] = useAddBoardTicketsMutation() 
	const [ bulkCreateNotifications, {isLoading: isBulkCreateNotificationLoading}] = useBulkCreateNotificationsMutation()
	const [ updateSprintTickets, { isLoading: isUpdateSprintTicketsLoading }] = useUpdateSprintTicketsMutation()
	const [ addNotification, {isLoading: isAddNotificationLoading}] = useAddNotificationMutation()
	const [ submitLoading, setSubmitLoading ] = useState(false) 
	const defaultForm: AddTicketFormValues = {
		id: undefined,
		name: "",
		ticketTypeId: {value: "", label: ""},
		description: "",
		priorityId: {value: "", label: ""},
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
	const assigneeNotificationType = notificationTypes?.find((notificationType) => notificationType?.name === "Ticket Assigned")

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
				priorityId: {label: priorities.find((priority) => priority.id === ticket.priorityId)?.name, value: ticket.priorityId.toString()},
				ticketTypeId: {label: ticketTypes.find((ticketType) => ticketType.id === ticket.ticketTypeId)?.name, value: ticket.ticketTypeId.toString()},
				userIdOption: {label: "", value: ""}
			})
		}
		else if (step && formValues){
			reset(formValues)
		}
		else {
			reset(defaultForm)
		}
	}, [ticket, formValues, step])

    const onSubmit = async (values: AddTicketFormValues) => {

		setSubmitLoading(true)
    	try {
    		const assigneeId = !isNaN(Number(values.userIdOption?.value)) ? Number(values.userIdOption?.value) : 0
	    	const {id: insertedTicketId, mentions} = await addTicket({
	    		...values, 
				priorityId: Number(values.priorityId.value), 
				ticketTypeId: Number(values.ticketTypeId.value),
	    		// this value is unused, just for typescript purposes
	    		userId: assigneeId,
	    		description: values.description,
				...(dueDate != null ? {
					dueDate: dueDate
				} : {})
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
			// only give notification when assigning the ticket to someone
			// other than the logged in user
			if (assigneeId && userProfile && userProfile.id !== assigneeId && assigneeNotificationType){
				await addNotification({
					recipientId: assigneeId,
					senderId: userProfile.id,
					ticketId: insertedTicketId,
					objectLink: `${TICKETS}/${insertedTicketId}`,
					notificationTypeId: assigneeNotificationType.id,
				}).unwrap()	
			}

			if (sprintId){
				await updateSprintTickets({sprintId: sprintId, ticketIds: [insertedTicketId]}).unwrap()
			}

			dispatch(setModalProps({}))
			dispatch(selectCurrentTicketId(insertedTicketId))
			dispatch(setModalType("EDIT_TICKET_FORM"))
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
    	finally {
			setSubmitLoading(false)
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
			                		defaultValue={watch("userIdOption") ?? {label: "", value: ""}}
				                	endpoint={USER_PROFILE_URL} 
									// include the ability to unassign for bulk edit
				                	urlParams={{forSelect: true, includeUnassigned: isBulkAction}} 
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
							{/* <select className = "tw-w-full" id = "ticket-priority" {...register("priorityId", registerOptions.priorityId)}>
								{priorities.map((priority: Priority) => {
									return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
								})}
							</select> */}
							<Controller name={"priorityId"} control={control} render={({field: {onChange}}) => (
								<Select 
									clearable={false}
									options={prioritiesForSelect}
									defaultValue={watch("priorityId") ?? {value: "", label: ""}}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}>
							</Controller>
					        {errors?.priorityId && <small className = "--text-alert">{errors.priorityId.message}</small>}
						</div>
						{
							!isBulkAction ? (
								<div className = "tw-space-y-2">
									<>
										<label className = "label" htmlFor = "ticket-type">Ticket Type</label>
										{/* <select className = "tw-w-full" id = "ticket-type" {...register("ticketTypeId", registerOptions.ticketTypeId)}>
											{ticketTypes.map((ticketType: TicketType) => {
												return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
											})}
										</select> */}
											<Controller name={"ticketTypeId"} control={control} render={({field: {onChange}}) => (
												<Select 
													clearable={false}
													options={ticketTypesForSelect}
													defaultValue={watch("ticketTypeId") ?? {value: "", label: ""}}
													onSelect={(selectedOption: {label: string, value: string} | null) => {
														onChange(selectedOption) 	
													}}
												/>
											)}>
											</Controller>
									</>
							        {errors?.ticketTypeId && <small className = "--text-alert">{errors.ticketTypeId.message}</small>}
							        {
							        	Number(watch("ticketTypeId").value) == epicTicketType?.id ? (
									        <div className = "tw-flex tw-flex tw-items-center tw-gap-x-2">
												<IconWarning color="var(--bs-warning)" className = "tw-h-6 tw-w-6"/>
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
									<LoadingButton isLoading={submitLoading} type="submit" className = "button" text={"Submit"}></LoadingButton>
								</div>
							)
						}
					</div>
				</form>
			</FormProvider>
		</div>
	)	
}
