import React, { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { useForm, FormProvider } from "react-hook-form"
import { 
	useAddTicketRelationshipMutation,
	useDeleteTicketRelationshipMutation,
} from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { TicketRow } from "./TicketRow"
import { TicketRelationship, TicketRelationshipType, Toast } from "../types/common"
import { LoadingSpinner } from "./LoadingSpinner"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"

type LinkedTicketFormValues = {
	parentTicketId: number | null
	childTicketId: number
	ticketRelationshipTypeId: number
}

type Props = {
	ticketRelationships: Array<TicketRelationship>
	showAddLinkedIssue: boolean
	setShowAddLinkedIssue: (val: boolean) => void
}

export const LinkedTicketForm = ({showAddLinkedIssue, setShowAddLinkedIssue, ticketRelationships}: Props) => {
	const { showModal } = useAppSelector((state) => state.modal) 
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const dispatch = useAppDispatch()
	const { currentTicketId, tickets } = useAppSelector((state) => state.board) 
	const { ticketRelationshipTypes } = useAppSelector((state) => state.ticketRelationshipType)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)  
	const [ addTicketRelationship, { error: addTicketRelationshipError, isLoading: isAddTicketRelationshipLoading }] = useAddTicketRelationshipMutation()
	const [ deleteTicketRelationship, { error: deleteTicketRelationshipError, isLoading: isDeleteTicketRelationshipLoading }] = useDeleteTicketRelationshipMutation()
	const ticket = tickets?.find((ticket) => ticket.id === currentTicketId)
	const epicTicketType = ticketTypes?.find((type) => type.name === "Epic")
	const epicTicketRelationshipType = ticketRelationshipTypes?.find((type) => type.name === "Epic")
    const groupedByRelationshipTypeId = ticketRelationships?.reduce((acc: {[id: string]: Array<TicketRelationship>}, obj: TicketRelationship) => {
    	if (obj.ticketRelationshipTypeId in acc){
    		acc[obj.ticketRelationshipTypeId].push(obj)
    	}	
    	else {
    		acc[obj.ticketRelationshipTypeId] = [obj]
    	}
    	return acc
    }, {})

	const defaultForm = {
		parentTicketId: currentTicketId,
		childTicketId: 0,
		ticketRelationshipTypeId: ticket?.ticketTypeId === epicTicketType?.id ? (epicTicketRelationshipType?.id ?? 0) : 0
	}
	const [preloadedValues, setPreloadedValues] = useState<LinkedTicketFormValues>(defaultForm)
	const { register , handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<LinkedTicketFormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
		childTicketId: { required: "Ticket is required"},
	    ticketRelationshipTypeId: { required: "Ticket Relationship Type is required" },
    }

    console.log("childTicketId: ", watch("childTicketId"))
    console.log("ticketrelationshiptypeid: ", watch("ticketRelationshipTypeId"))


    useEffect(() => {
    	if (showModal){
    		console.log("resetted?")
    		reset(defaultForm)
    	}	
    }, [showModal])

    const isTicketInRelationship = (ticketId: number, relationship: TicketRelationship) => {
	    return ticketId !== currentTicketId && (ticketId === relationship.childTicketId || ticketId === relationship.parentTicketId)
    }

    const isTicketAlreadyLinked = (ticketId: number) => {
    	const linkedTickets = ticketRelationships?.filter((relationship) => isTicketInRelationship(ticketId, relationship))
    	return linkedTickets.length 
    }

    const onUnlink = async (ticketId: number | undefined, ticketRelationshipId: number) => {
    	// let defaultToast: Toast = {
		// 	id: uuidv4(),
		// 	message: "Something went wrong while un-linking ticket.",
		// 	animationType: "animation-in",
		// 	type: "failure"
    	// }
    	// if (ticketId && ticketRelationshipId){
	    // 	try {
		//     	await deleteTicketRelationship({ticketId, ticketRelationshipId}).unwrap()
		//     	dispatch(addToast({
		//     		...defaultToast,
		//     		message: "Ticket unlinked successfully!",
		//     		type: "success"
		//     	}))
	    // 	}
	    // 	catch (e) {
	    // 		dispatch(addToast(defaultToast))
	    // 	}
    	// }
    	// else {
    	// 	dispatch(addToast(defaultToast))
    	// }
    	dispatch(toggleShowSecondaryModal(true))
    	dispatch(setSecondaryModalProps({ticketId: ticketId, ticketRelationshipId: ticketRelationshipId}))
    	dispatch(setSecondaryModalType("SHOW_UNLINK_TICKET_WARNING"))
    }

    const onSubmit = async (values: LinkedTicketFormValues) => {
    	let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while linking ticket.",
			animationType: "animation-in",
			type: "failure"
    	}
    	if (currentTicketId){
	    	try {
		    	await addTicketRelationship({
		    		parentTicketId: values.parentTicketId ?? 0,
		    		childTicketId: values.childTicketId ?? 0,
		    		ticketRelationshipTypeId: values.ticketRelationshipTypeId ?? 0
		    	}).unwrap()
		    	dispatch(addToast({
		    		...defaultToast,
		    		message: "Ticket linked successfully!",
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
    }

	return (
		<div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					groupedByRelationshipTypeId && Object.keys(groupedByRelationshipTypeId).length > 0 ? Object.keys(groupedByRelationshipTypeId).map((relationshipTypeId) => {
						const type = ticketRelationshipTypes.find((type) => type.id === parseInt(relationshipTypeId))
						const groupedTicketRelationships = groupedByRelationshipTypeId[relationshipTypeId as keyof typeof groupedByRelationshipTypeId]
						return (
							<div key = {`relationship_type_${relationshipTypeId}`} className = "tw-flex tw-flex-col tw-gap-y-2">
								<div><span className = "tw-font-medium tw-text-gray-500">{type?.name}</span></div>
								<div className = "tw-flex tw-flex-col tw-gap-y-1">
									{
										groupedTicketRelationships?.length && groupedTicketRelationships.map((relationship: TicketRelationship) => {
											return (<TicketRow 
												key={`relationship_ticket_${relationship.childTicketId},${relationship.parentTicketId}`} 
												ticket={tickets.find((ticket) => isTicketInRelationship(ticket.id, relationship))}
												ticketRelationshipId={relationship.id}
												onUnlink={onUnlink}
												showUnlink={true}
											/>)
										})
									}
								</div>
							</div>
						)
					}) : null
				}
				{
					showAddLinkedIssue ? (
						<form className = "tw-flex tw-flex-col tw-gap-y-2">
							<div className = "tw-flex tw-flex-row tw-gap-x-2">
								<div className = "tw-w-1/3 tw-w-full tw-flex tw-flex-col tw-gap-y-1">
									<select className = "tw-w-full" {...register("ticketRelationshipTypeId", registerOptions.ticketRelationshipTypeId)}>
										{ticketRelationshipTypes.map((type) => 
											<option key = {type.id} value = {type.id}>{type.name}</option>
										)}
									</select>
							        {errors?.ticketRelationshipTypeId && <small className = "--text-alert">{errors.ticketRelationshipTypeId.message}</small>}
								</div>
								<div className = "tw-w-2/3 tw-w-full tw-flex tw-flex-col tw-gap-y-1">
									{/* TODO: autocomplete search box instead of select menu */}	
									<select className = "tw-w-full" {...register("childTicketId", registerOptions.childTicketId)}>	
										{/* The current ticket should not be available for selection, as well as any ticket that has already been linked as a parent or child*/}
										{tickets.filter((ticket) => ticket.id !== currentTicketId && !isTicketAlreadyLinked(ticket.id)).map((ticket) => 
											<option key = {ticket.id} value = {ticket.id}>{ticket.name}</option>
										)}
									</select>
							        {errors?.childTicketId && <small className = "--text-alert">{errors.childTicketId.message}</small>}
								</div>
							</div>
							<div className = "tw-flex tw-flex-row tw-justify-end">
								<div className = "btn-group">
									<button className = "button" onClick = {async (e) => {
										e.preventDefault()
										await handleSubmit(onSubmit)()
										if (!Object.keys(errors).length){
											reset(defaultForm)
										}
									}}>Link</button>
									<button className = "button --secondary" onClick = {(e) => {
										e.preventDefault()
										setShowAddLinkedIssue(false)
									}}>Cancel</button>
								</div>
							</div>
						</form>
					) : null 
				}
			</div>
		</div>
	)	
}