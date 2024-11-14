import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import type { UserProfile, Status, Ticket, TicketType, Priority } from "../types/common"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../services/private/board"
import { 
	useAddTicketMutation, 
	useDeleteTicketMutation, 
	useUpdateTicketMutation,
	useBulkEditTicketAssigneesMutation,
	useGetTicketAssigneesQuery,
	useGetTicketQuery,
} 
from "../services/private/ticket"
import { addToast } from "../slices/toastSlice" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "./LoadingSpinner"
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"
import { IoIosWarning as WarningIcon } from "react-icons/io"
import { IconContext } from "react-icons"
import { LoadingButton } from "./page-elements/LoadingButton"

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
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	// only run query if currentTicketId is not null, otherwise it will pass in the skipToken,
	// which notifies RTK query to skip this 
	// const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const [ addTicket, {isLoading: isAddTicketLoading, error: isAddTicketError} ] = useAddTicketMutation() 
	const [ updateTicket, {isLoading: isUpdateTicketLoading, error: isUpdateTicketError} ] = useUpdateTicketMutation() 
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
	const { register , handleSubmit, reset , setValue, getValues, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

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
			reset(ticket)
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, ticket])

    const onSubmit = async (values: FormValues) => {
    	try {
    		// update existing ticket
    		if (values.id != null){
    			await updateTicket({...values, id: values.id}).unwrap()
    			// update ticket assignees
    			// TODO: need to update this line to include all userIds if allowing multiple 
    			// assignees per ticket
    			if (values.userId){
	    			await bulkEditTicketAssignees({ticketId: values.id, userIds: [values.userId]}).unwrap()
    			}
    		}
    		// add new ticket
    		else {
		    	const data = await addTicket(values).unwrap()
		    	if (boardId){
			    	await addBoardTickets({boardId: boardId, ticketIds: [data.id]}).unwrap()
		    	}
		    	// update ticket assignees
		    	if (values.userId){
		    		await bulkEditTicketAssignees({ticketId: data.id, userIds: [values.userId]}).unwrap()
		    	}
    		}
			dispatch(toggleShowModal(false))
			dispatch(selectCurrentTicketId(null))
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket ${values.id != null ? "updated" : "added"} successfully!`,
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

    const onDelete = async () => {
    	if (ticket && boardId){
	    	try {
		    	await deleteBoardTicket({boardId: boardId, ticketId: ticket?.id}).unwrap()
		    	await deleteTicket(ticket?.id).unwrap()
				dispatch(toggleShowModal(false))
				dispatch(selectCurrentTicketId(null))
	    		dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: "Ticket deleted successfully!",
	    		}))
	    	}
	    	catch (e) {
	    		dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to delete ticket",
	    		}))
	    	}
    	}
    }

	return (
		<div className = "tw-flex tw-flex-col tw-w-[500px]">
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
						<textarea className = "tw-w-full" rows={8} id = "ticket-description" {...register("description", registerOptions.description)}></textarea>
				        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
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
						<label className = "label" htmlFor = "ticket-assignee">Assignee</label>
						<select className = "tw-w-full" id = "ticket-assignee" {...register("userId", registerOptions.userId)}>
							{userProfiles.map((profile: UserProfile) => {
								return <option disabled={
									(profile.userRoleId === adminRole?.id || profile.userRoleId === boardAdminRole?.id) && 
									(userProfile?.userRoleId !== adminRole?.id && userProfile?.userRoleId !== boardAdminRole?.id)} key = {profile.id} value = {profile.id}>{profile.firstName + " " + profile.lastName}</option>
							})}
						</select>
				        {errors?.userId && <small className = "--text-alert">{errors.userId.message}</small>}
					</div>
					<div>
						<LoadingButton onClick={handleSubmit(onSubmit)} className = "button" text={"Submit"}></LoadingButton>
						{
							ticket ? (
								<>
								{/*	<button onClick={
										(e) => {
											e.preventDefault()
											onDelete()
										}
									} className = "btn --alert">Delete</button>*/}
									<LoadingButton className = "button --alert" text={"Delete"} onClick={(e) => {
										e.preventDefault()
										onDelete()
									}}/>
								</>
							) : null
						}
					</div>
				</div>
			</form>
		</div>
	)	
}
