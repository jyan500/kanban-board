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
} 
from "../services/private/ticket"
import { addToast } from "../slices/toastSlice" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSpinner } from "./LoadingSpinner"
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"

export type FormValues = {
	id?: number
	name: string
	description: string
	priorityId: number
	statusId: number
	ticketTypeId: number
	userId: number
}

export const TicketForm = () => {
	const dispatch = useAppDispatch()
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	// const { tickets } = useAppSelector((state) => state.ticket) 
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const { 
		currentTicketId, 
		board, 
		boardInfo, 
		statusesToDisplay, 
		tickets 
	} = useAppSelector((state) => state.board)
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	// only run query if currentTicketId is not null, otherwise it will pass in the skipToken,
	// which notifies RTK query to skip this 
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
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
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	const adminRole = userRoles?.find((role) => role.name === "ADMIN")
	const boardAdminRole = userRoles?.find((role) => role.name === "BOARD_ADMIN")

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
		if (currentTicketId){
			let ticket = tickets.find((t: Ticket) => t.id === currentTicketId)
			let ticketWithAssignee = {...ticket, userId: ticketAssignees?.length ? ticketAssignees[0].id : 0}
			reset(ticketWithAssignee)
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, currentTicketId])

	useEffect(() => {
		if (!isTicketAssigneesLoading){
			let ticket = tickets.find((t: Ticket) => t.id === currentTicketId)
			setValue("userId", ticketAssignees?.length ? ticketAssignees[0].id : 0, { shouldDirty: true })
		}
	}, [ticketAssignees])

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
		    	if (boardInfo){
			    	await addBoardTickets({boardId: boardInfo.id, ticketIds: [data.id]}).unwrap()
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
    	if (currentTicketId && boardInfo?.id){
	    	try {
		    	await deleteBoardTicket({boardId: boardInfo.id, ticketId: currentTicketId}).unwrap()
		    	await deleteTicket(currentTicketId).unwrap()
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
		<div className = "container">
			<form>
				{!isTicketAssigneesLoading ? (
					<>
						<div className = "form-row">
							<div className = "form-cell">
								<label htmlFor="ticket-name">Name</label>
								<input id = "ticket-name" type = "text"
								{...register("name", registerOptions.name)}
								/>
						        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
							</div>
							<div className = "form-cell">
								<label htmlFor = "ticket-status">Status</label>
								<select id = "ticket-status" {...register("statusId", registerOptions.statusId)}>
									{statusesToDisplay.map((status: Status) => {
										return <option key = {status.id} value = {status.id}>{status.name}</option>
									})}
								</select>	
						        {errors?.statusId && <small className = "--text-alert">{errors.statusId.message}</small>}
							</div>
							<div className = "form-cell">
								<label htmlFor = "ticket-description">Description</label>
								<textarea id = "ticket-description" {...register("description", registerOptions.description)}></textarea>
						        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
							</div>
								<div className = "form-cell">
								<label htmlFor = "ticket-priority">Priority</label>
								<select id = "ticket-priority" {...register("priorityId", registerOptions.priorityId)}>
									{priorities.map((priority: Priority) => {
										return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
									})}
								</select>
						        {errors?.priorityId && <small className = "--text-alert">{errors.priorityId.message}</small>}
							</div>
							<div className = "form-cell">
								<label htmlFor = "ticket-type">Ticket Type</label>
								<select id = "ticket-type" {...register("ticketTypeId", registerOptions.ticketTypeId)}>
									{ticketTypes.map((ticketType: TicketType) => {
										return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
									})}
								</select>
						        {errors?.ticketTypeId && <small className = "--text-alert">{errors.ticketTypeId.message}</small>}
							</div>
							<div className = "form-cell">
								<label htmlFor = "ticket-assignee">Assignee</label>
								<select id = "ticket-assignee" {...register("userId", registerOptions.userId)}>
									{userProfiles.map((profile: UserProfile) => {
										return <option disabled={
											(profile.userRoleId === adminRole?.id || profile.userRoleId === boardAdminRole?.id) && 
											(userProfile?.userRoleId !== adminRole?.id && userProfile?.userRoleId !== boardAdminRole?.id)} key = {profile.id} value = {profile.id}>{profile.firstName + " " + profile.lastName}</option>
									})}
								</select>
						        {errors?.userId && <small className = "--text-alert">{errors.userId.message}</small>}
							</div>
						</div>
						<div className = "form-row">
							<div className = "btn-group">
								<button onClick={handleSubmit(onSubmit)} className = "btn">Submit</button>
							</div>
							{
								currentTicketId && boardInfo?.id ? (
									<div className = "btn-group">
										<button onClick={
											(e) => {
												e.preventDefault()
												onDelete()
											}
										} className = "btn --alert">Delete</button>
									</div>
								) : null
							}
						</div>
					</>
				) : (
					<LoadingSpinner/>	
				)}
			</form>
		</div>
	)	
}
