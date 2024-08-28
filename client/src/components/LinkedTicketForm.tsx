import React, { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { useForm, FormProvider } from "react-hook-form"
import { useGetTicketRelationshipsQuery } from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { TicketRow } from "./TicketRow"
import { TicketRelationship, TicketRelationshipType } from "../types/common"

type LinkedTicketFormValues = {
	id: number
	parentTicketId: number | null
	childTicketId: number
	ticketRelationshipTypeId: number
}

export const LinkedTicketForm = () => {
	const { showModal } = useAppSelector((state) => state.modal) 
	const { currentTicketId, tickets } = useAppSelector((state) => state.board) 
	const { ticketRelationshipTypes } = useAppSelector((state) => state.ticketRelationshipType)
	const { ticketTypes } = useAppSelector((state) => state.ticketType)  
	const { data: ticketRelationships, isLoading: isTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ?? skipToken)
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

    console.log("groupedByRelationshipTypeId: ", groupedByRelationshipTypeId)

	const defaultForm = {
		id: 0,
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


    useEffect(() => {
    	if (showModal){
    		reset(defaultForm)
    	}	
    }, [showModal])

    const onSubmit = async (values: LinkedTicketFormValues) => {

    }

	return (
		<div>
			<form>
				<div>
					{groupedByRelationshipTypeId && Object.keys(groupedByRelationshipTypeId).length > 0 ? Object.keys(groupedByRelationshipTypeId).map((relationshipTypeId) => {
						const type = ticketRelationshipTypes.find((type) => type.id === parseInt(relationshipTypeId))
						const groupedTicketRelationships = groupedByRelationshipTypeId[relationshipTypeId as keyof typeof groupedByRelationshipTypeId]
						return (
							<>
								<div className = "tw-py-2"><span className = "tw-font-medium tw-text-gray-500">{type?.name}</span></div>
								<div className = "tw-py-2">
									{
										groupedTicketRelationships?.length && groupedTicketRelationships.map((relationship: TicketRelationship) => {
											return (<TicketRow ticket={tickets.find((ticket) => ticket?.id === relationship.childTicketId || ticket?.id === relationship.parentTicketId)}/>)
										})
									}
								</div>
							</>
						)
					}
					) : null}
					<div className = "tw-py-2">
						<select {...register("ticketRelationshipTypeId", registerOptions.ticketRelationshipTypeId)}>
							{ticketRelationshipTypes.map((type) => 
								<option key = {type.id} value = {type.id}>{type.name}</option>
							)}
						</select>
						{/* TODO: autocomplete search box instead of select menu */}	
						<select {...register("childTicketId", registerOptions.childTicketId)}>	
							{tickets.map((ticket) => 
								<option key = {ticket.id} value = {ticket.id}>{ticket.name}</option>
							)}
						</select>
					</div>
				</div>
				<div className = "tw-py-2 tw-flex tw-flex-row tw-justify-between">
					{/*<button onClick = {(e) => {
						e.preventDefault()
					}}>Create Linked Issue</button>*/}
					<div>
						<span>+ Linked Issue</span>
					</div>
					<div className = "btn-group">
						<button onClick = {(e) => {
							e.preventDefault()
						}}>Link</button>
						<button onClick = {(e) => {
							e.preventDefault()
						}}>Cancel</button>
					</div>
				</div>
			</form>
		</div>
	)	
}