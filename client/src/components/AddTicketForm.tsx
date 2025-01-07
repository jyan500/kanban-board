import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { Controller, useForm, FormProvider } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { UserProfile, Status, Ticket, TicketType, Priority } from "../types/common"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../services/private/board"
import { 
	useAddTicketMutation, 
	useDeleteTicketMutation, 
	useBulkEditTicketAssigneesMutation,
} 
from "../services/private/ticket"
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
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { SimpleEditor } from "./page-elements/SimpleEditor"
import { 
	TextArea,
	textAreaValidation, 
	convertEditorStateToJSON, 
	convertEditorStateToHTML, 
	convertJSONToEditorState 
} from "./page-elements/TextArea"

export type FormValues = {
	id?: number
	name: string
	description: string 
	priorityId: number
	statusId: number
	ticketTypeId: number
	userId: number
}

type Props = {
	boardId?: number | null | undefined
	ticket?: Ticket | null | undefined
	statusesToDisplay?: Array<Status>
}

export const AddTicketForm = ({boardId, ticket, statusesToDisplay}: Props) => {
	const dispatch = useAppDispatch()
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	// only run query if currentTicketId is not null, otherwise it will pass in the skipToken,
	// which notifies RTK query to skip this 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ deleteTicket, {isLoading: isDeleteTicketLoading, error: isDeleteTicketError} ] = useDeleteTicketMutation()
	const [ addBoardTickets, {isLoading: isAddBoardTicketsLoading, error: isAddBoardTicketsError} ] = useAddBoardTicketsMutation() 
	const [ deleteBoardTicket, {isLoading: isDeleteBoardTicketLoading, error: isDeleteBoardTicketError}] = useDeleteBoardTicketMutation()
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		description: "",
		priorityId: 0,
		statusId: 0,
		ticketTypeId: 0,
		userId: 0 
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , control, setValue, getValues, watch, formState: {errors} } = methods

	const adminRole = userRoles?.find((role) => role.name === "ADMIN")
	const boardAdminRole = userRoles?.find((role) => role.name === "BOARD_ADMIN")
	const epicTicketType = ticketTypes?.find((ticketType) => ticketType?.name === "Epic")

	const registerOptions = {
	    name: { required: "Name is required" },
		description: { required: "Description is required"},
	    priorityId: { required: "Priority is required"},
	    statusId: { required: "Status is required"},
	    ticketTypeId: { required: "Ticket Type is required"},
	    userId: {}
    }

	useEffect(() => {
		// initialize with current values if the ticket exists
		if (ticket){
			reset({
				...ticket, 
				id: undefined,
				userId: 0
			})
		}
		else {
			reset(defaultForm)
		}
	}, [ticket])

    const onSubmit = async (values: FormValues) => {
    	try {
	    	const data = await addTicket({
	    		...values, 
	    		description: values.description
	    	}).unwrap()
	    	if (boardId){
		    	await addBoardTickets({boardId: boardId, ticketIds: [data.id]}).unwrap()
	    	}
	    	// update ticket assignees
	    	if (values.userId){
	    		await bulkEditTicketAssignees({ticketId: data.id, isWatcher: false, userIds: [values.userId]}).unwrap()
	    	}
			dispatch(toggleShowModal(false))
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
		<div className = "tw-flex tw-flex-col tw-w-[500px]">
			<FormProvider {...methods}>
				<form>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<div>
							<label className = "label" htmlFor="ticket-name">Name</label>
							<input className = "tw-w-full" id = "ticket-name" type = "text"
							{...register("name", registerOptions.name)}
							/>
					        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
						</div>
						<div>
							<label className = "label" htmlFor = "ticket-status">Status</label>
							<select className = "tw-w-full" id = "ticket-status" {...register("statusId", registerOptions.statusId)}>
								{statusesToDisplay?.map((status: Status) => {
									return <option key = {status.id} value = {status.id}>{status.name}</option>
								})}
							</select>	
					        {errors?.statusId && <small className = "--text-alert">{errors.statusId.message}</small>}
						</div>
						<div>
							<label className = "label" htmlFor = "ticket-description">Description</label>
							<SimpleEditor
								registerField={"description"}
								registerOptions={registerOptions.description}
							/>
					        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
					    </div>
					    <div>
							<label className = "label" htmlFor = "ticket-assignee">Assignee</label>
							<Controller
								name={"userId"}
								control={control}
				                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncSelect 
				                	endpoint={USER_PROFILE_URL} 
				                	urlParams={{forSelect: true}} 
				                	className={"tw-w-full"}
				                	onSelect={(selectedOption: {label: string, value: string} | null) => {
				                		onChange(selectedOption?.value ?? "") 	
				                	}}
				                />
			                )}
							/>
					        {errors?.userId && <small className = "--text-alert">{errors.userId.message}</small>}
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
										<span className = "tw-font-bold">If the ticket type is "Epic", it cannot changed once saved.</span>
									</div>
					        	) : null
					        }
						</div>
						
						<div>
							<LoadingButton onClick={handleSubmit(onSubmit)} className = "button" text={"Submit"}></LoadingButton>
						</div>
					</div>
				</form>
			</FormProvider>
		</div>
	)	
}
