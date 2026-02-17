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
import { Label } from "./page-elements/Label"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../helpers/constants"

export type FormCommon = {
	id?: number
	name: string
	description: string 
	priorityId: OptionType 
	statusId: OptionType 
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
		statusId: {value: "", label: ""},
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
				statusId: {label: statuses.find((status) => status.id === ticket.statusId)?.name, value: ticket.statusId.toString()},
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
				statusId: !isNaN(Number(values.statusId.value)) ? Number(values.statusId.value) : 0,
				priorityId: !isNaN(Number(values.priorityId.value)) ? Number(values.priorityId.value) : 0,  
				ticketTypeId: !isNaN(Number(values.ticketTypeId.value)) ? Number(values.ticketTypeId.value) : 0,
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
				<form className="tw-flex tw-flex-col tw-gap-y-4" onSubmit={handleSubmit(propsOnSubmit ?? onSubmit)}>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						{title ? <p className = {`${PRIMARY_TEXT} tw-font-bold`}>{title}</p> : null}
						{
							isBulkAction ? <span className = {`${SECONDARY_TEXT} tw-text-xs tw-font-semibold`}>Fill out the fields that you would like to update across all the selected tickets. Blank fields will be unchanged on the selected tickets.</span> : null
						}
						{
							!isBulkAction ? (
								<div className = "tw-flex tw-flex-col tw-gap-y-2">
									<Label htmlFor="ticket-name">Name</Label>
									<input className = "tw-w-full" id = "ticket-name" type = "text"
									{...register("name", registerOptions.name)}
									/>
							        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
								</div>
							) : null
						}
						<div className="tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "ticket-status">Status</Label>
							<Controller name={"statusId"} control={control} render={({field: {onChange}}) => (
								<Select 
									id={"ticket-status"}
									clearable={false}
									menuInPortal={true}
									options={statusesToDisplay?.map((status) => ({
										label: status.name,
										value: status.id.toString()
									})) ?? []}
									defaultValue={watch("statusId") ?? {value: "", label: ""}}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}>
							</Controller>
					        {errors?.statusId && <small className = "--text-alert">{errors.statusId.message}</small>}
						</div>
						{
							!isBulkAction ? (
								<div className = "tw-flex tw-flex-col tw-gap-y-2">
									<Label htmlFor = "ticket-description">Description</Label>
									<SimpleEditor
										id={"ticket-description"}
										registerField={"description"}
										registerOptions={registerOptions.description}
										mentionsEnabled={true}
									/>
							        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
							    </div>
							) : null
						}
					    <div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "ticket-assignee">Assignee</Label>
							<Controller
								name={"userIdOption"}
								control={control}
				                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncSelect 
									id={"ticket-assignee"}
									menuInPortal={true}
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
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "ticket-priority">Priority</Label>
							<Controller name={"priorityId"} control={control} render={({field: {onChange}}) => (
								<Select 
									id={"ticket-priority"}
									menuInPortal={true}
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
										<Label htmlFor = "ticket-type">Ticket Type</Label>
										<Controller name={"ticketTypeId"} control={control} render={({field: {onChange}}) => (
											<Select 
												id={"ticket-type"}
												clearable={false}
												menuInPortal={true}
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
												<IconWarning className = "tw-h-6 tw-w-6 tw-text-warning"/>
												<span className = {`tw-font-semibold ${SECONDARY_TEXT}`}>If the ticket type is "Epic", it cannot changed once saved.</span>
											</div>
							        	) : null
							        }
								</div>	
							) : null
						}

					</div>
					{
						buttonBar ? buttonBar : (
							<div>
								<LoadingButton isLoading={submitLoading} type="submit" className = "button" text={"Submit"}></LoadingButton>
							</div>
						)
					}
				</form>
			</FormProvider>
		</div>
	)	
}
