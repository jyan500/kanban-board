import React, {useState, useEffect} from "react"
import { IconContext } from "react-icons"
import "../styles/edit-ticket-form.css"
import { CgProfile } from "react-icons/cg"
import { HiOutlineLink as LinkIcon } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { setModalType } from "../slices/modalSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { 
	useGetTicketAssigneesQuery, 
	useGetTicketRelationshipsQuery, 
	useGetTicketCommentsQuery,
	useUpdateTicketMutation, 
	useBulkEditTicketAssigneesMutation 
} from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
import { useForm, FormProvider } from "react-hook-form"
import { Ticket, TicketType, Priority, UserProfile } from "../types/common"

import { FormValues } from "./AddTicketForm" 
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions"
import { TicketCommentForm } from "./TicketCommentForm"
import { LinkedTicketForm } from "./LinkedTicketForm"
import { EditTicketFormToolbar } from "./EditTicketFormToolbar" 
import { priorityIconMap, TicketTypeIcon , colorMap } from "./Ticket"
import { EditTicketFormMenuDropdown } from "./EditTicketFormMenuDropdown" 

type EditFieldVisibility = {
	[key: string]: boolean
}

export const EditTicketForm = () => {
	const {
		tickets,
		currentTicketId,
		statusesToDisplay
	} = useAppSelector((state) => state.board)
	const dispatch = useAppDispatch()
	const { statuses } = useAppSelector((state) => state.status)
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const { priorities } = useAppSelector((state) => state.priority) 
	const { ticketTypes } = useAppSelector((state) => state.ticketType) 
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
	const { data: ticketComments, isLoading: isTicketCommentsLoading } = useGetTicketCommentsQuery(currentTicketId ?? skipToken)
	const { data: ticketRelationships, isLoading: isTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ?? skipToken)
	const [ updateTicket, {isLoading: isUpdateTicketLoading, error: isUpdateTicketError} ] = useUpdateTicketMutation() 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const ticket = tickets.find((ticket) => ticket.id === currentTicketId)
	const createdAt = ticket?.createdAt ? new Date(ticket?.createdAt).toLocaleDateString() : ""
	const reporter = userProfiles?.find((user) => user.id === ticket?.userId)
	const [editFieldVisibility, setEditFieldVisibility] = useState<EditFieldVisibility>({
		"name": false,
		"description": false,
		"assignees": false,
		"priority": false,
		"ticket-type": false
	})
	const [showAddLinkedIssue, setShowAddLinkedIssue] = useState(false)
	const defaultForm: FormValues = {
		id: 0,
		name: "",
		description: "",
		priorityId: 0,
		statusId: 0,
		ticketTypeId: 0,
		userId: 0,
	}	
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset, setValue, watch, formState: {errors} } = methods
	const registerOptions = {
	    name: { required: "Name is required" },
	    description: { required: "Description is required"},
	    priorityId: { required: "Priority is required"},
	    statusId: { required: "Status is required"},
	    ticketTypeId: { required: "Ticket Type is required"},
	    userId: {}
    }
	const adminRole = userRoles?.find((role) => role.name === "ADMIN")
	const boardAdminRole = userRoles?.find((role) => role.name === "BOARD_ADMIN")

	const userIdRegisterMethods = register("userId", registerOptions.userId)
	const ticketTypeIdRegisterMethods = register("ticketTypeId", registerOptions.ticketTypeId)
	const priorityIdRegisterMethods = register("priorityId", registerOptions.priorityId)

	const ticketTypeName = ticketTypes.find((ticketType) => ticketType.id === watch("ticketTypeId"))?.name
	const priorityName = priorities.find((priority) => priority.id === watch("priorityId"))?.name

	const toggleFieldVisibility = (field: string, flag: boolean) => {
		let fieldVisibility = {...editFieldVisibility}
		for (let key in fieldVisibility){
			if (key === field){
				fieldVisibility[key] = flag
			}
			else {
				fieldVisibility[key] = false
			}
		}
		setEditFieldVisibility(fieldVisibility)
	}

	useEffect(() => {
		if (!showModal){
			setEditFieldVisibility({
				"name": false,
				"description": false,
				"assignees": false,
				"priority": false,
				"ticket-type": false
			})
			setShowAddLinkedIssue(false)
		}
		// initialize with current values if the ticket exists
		if (currentTicketId){
			let ticket = tickets.find((t: Ticket) => t.id === currentTicketId)
			reset({...ticket, userId: ticketAssignees?.length ? ticketAssignees[0].id : 0} ?? defaultForm)
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


	const userProfileSelect = ( 
		<select {...userIdRegisterMethods}
		className = {`tw-w-full ${editFieldVisibility.assignees ? "" : "tw-border-transparent"}`}
		onChange={async (e) => {
			setValue("userId", parseInt(e.target.value))
			toggleFieldVisibility("assignee", false)
		    await handleSubmit(onSubmit)()
		}}
		onBlur = {(e) => toggleFieldVisibility("assignee", false)}
		>
			{userProfiles.map((profile: UserProfile) => {
				return <option disabled={
					(profile.userRoleId === adminRole?.id || profile.userRoleId === boardAdminRole?.id) && 
					(userProfile?.userRoleId !== adminRole?.id && userProfile?.userRoleId !== boardAdminRole?.id)} key = {profile.id} value = {profile.id}>{displayUser(profile)}</option>
			})}
		</select>
	)

	const ticketTypeSelect = (
		<select {...ticketTypeIdRegisterMethods} 
		className = {`tw-w-full ${editFieldVisibility["ticket-type"] ? "" : "tw-border-transparent"}`}
		onChange={async (e) => {
			setValue("ticketTypeId", parseInt(e.target.value))
			toggleFieldVisibility("ticket-type", false)
			await handleSubmit(onSubmit)()
		}}
		onBlur = {(e) => toggleFieldVisibility("ticket-type", false)}>
			{ticketTypes?.map((ticketType: TicketType) => {
				return (
					<option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
				)
			})}
		</select>
	)

	const prioritySelect = (
		<select {...priorityIdRegisterMethods} 
		className = {`tw-w-full ${editFieldVisibility["priority"] ? "" : "tw-border-transparent"}`}
		onChange={async (e) => {
			setValue("priorityId", parseInt(e.target.value))
			toggleFieldVisibility("priority", false)
			await handleSubmit(onSubmit)()
		}}
		onBlur = {(e) => toggleFieldVisibility("priority", false)}>
			{priorities?.map((priority: Priority) => {
				return (
					<option key = {priority.id} value = {priority.id}>{priority.name}</option>
				)
			})}
		</select>
	)

	return (
		<div className = "tw-flex tw-flex-col tw-w-full">
			<FormProvider {...methods}>
				<form>
					<div className = "tw-flex tw-flex-row tw-gap-x-4">
						<div className = "tw-w-2/3">
							<div className = "tw-pb-2">
							{
								!editFieldVisibility.name ? (
									<div onClick = {(e) => toggleFieldVisibility("name", true)} className = "hover:tw-opacity-60 tw-cursor-pointer tw-font-bold tw-text-3xl">
										{watch("name")}
									</div>
								) : (
									<>
										<InlineEdit onSubmit = {async () => {
											await handleSubmit(onSubmit)()
											toggleFieldVisibility("name", false)
										}} registerField = {"name"} registerOptions = {registerOptions.name} type = "text" value={watch("name")} onCancel={() => {toggleFieldVisibility("name", false)}}/>
								        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
							        </>
								)
							}
							</div>
							<div className = "tw-pb-2">
								<button onClick={(e) => {
									e.preventDefault()	
									setShowAddLinkedIssue(!showAddLinkedIssue)
								}} className = "button !tw-bg-gray-500">
									<div className = "icon-container">
										<IconContext.Provider value = {{className: "icon"}}>
											<LinkIcon/>
										</IconContext.Provider>
										<span>Link Issue</span>
									</div>
								</button>
							</div>
							<div className = "">
								<strong>Description</strong>
								<>
									{
										!editFieldVisibility.description ? (
											<div onClick = {(e) => toggleFieldVisibility("description", true)} className = "hover:tw-opacity-60 tw-cursor-pointer">
												{watch("description")}
											</div>
										) : (
											<>
												<InlineEdit onSubmit={async () => {
													await handleSubmit(onSubmit)()
													toggleFieldVisibility("description", false)
												}} registerField = {"description"} registerOptions = {registerOptions.description} type = "textarea" value={watch("description")} onCancel={() => toggleFieldVisibility("description", false)}/>
										        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
											</>
										)
									}
								</>
							</div>
						</div>
						<div className = "tw-w-1/3">
							<EditTicketFormToolbar/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<select 
								{...register("statusId", registerOptions.statusId)} 
								onChange={(e) => {
									setValue("statusId", parseInt(e.target.value))
								    handleSubmit(onSubmit)()
								}}
								className = "tw-w-full status-select">
									{statusesToDisplay.map((status) => {
											return (
												<option key = {status.id} value = {status.id}>{status.name}</option>
											)
										})
									}
								</select>
								<div className = "tw-flex tw-flex-col tw-gap-y-2">
									<span className = "tw-font-bold tw-text-xl">Details</span>
									<div className = "tw-flex tw-flex-row tw-w-full tw-items-center">
										<span className = "tw-font-semibold tw-w-1/2">Assignee</span>
										{
											!isTicketAssigneesLoading ? (
												<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => toggleFieldVisibility("assignees", true)}>
													<IconContext.Provider value = {{className: "tw-shrink-0 tw-h-8 tw-w-8"}}>
														<CgProfile/>
													</IconContext.Provider>
													{userProfileSelect}		
												</div>
											) : <LoadingSpinner/>
										}	
									</div>
									<div className = "tw-flex tw-flex-row tw-w-full tw-items-center">
										<span className = "tw-font-semibold tw-w-1/2">Reporter</span>	
										<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center">
											<IconContext.Provider value = {{className: "tw-shrink-0 tw-h-8 tw-w-8"}}>
												<CgProfile/>
											</IconContext.Provider>
											<div className = "tw-ml-3.5">{displayUser(reporter)}</div>
										</div>
									</div>
									<div className = "tw-flex tw-flex-row tw-w-full tw-items-center">
										<span className = "tw-font-semibold tw-w-1/2">Priority</span>
										<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => {toggleFieldVisibility("priority", true)}}>
											<IconContext.Provider value = {{color: priorityName && priorityName in colorMap ? colorMap[priorityName] : "", className: "tw-shrink-0 tw-w-8 tw-h-8"}}>
												{priorityName && priorityName in priorityIconMap ? priorityIconMap[priorityName] : null}	
											</IconContext.Provider>	
											{prioritySelect}
										</div>
									</div>
									<div className = "tw-flex tw-flex-row tw-w-full tw-items-center">
										<span className = "tw-font-semibold tw-w-1/2">Ticket Type</span>	
										<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => {toggleFieldVisibility("ticket-type", true)}}>
											{ticketTypeName ? <TicketTypeIcon type={ticketTypeName} className = "tw-ml-1.5 tw-w-6 tw-h-6 tw-shrink-0"/> : null}
											<div className = "tw-w-full tw-ml-0.5">{ticketTypeSelect}</div>
										</div>
									</div>
								</div>
							</div>
							<div className = "tw-pt-2 tw-pb-2"><strong>Created {createdAt}</strong></div>
						</div>
					</div>
				</form>
			</FormProvider>
			<div className = "tw-flex tw-flex-col tw-w-2/3 tw-gap-y-2">
				<div className = "tw-space-y-2">
					{!isTicketRelationshipsLoading ? (
						setShowAddLinkedIssue || ticketRelationships?.length ? 
						<>
							<strong>Linked Issues</strong>	
							<LinkedTicketForm showAddLinkedIssue={showAddLinkedIssue} setShowAddLinkedIssue={setShowAddLinkedIssue} ticketRelationships={ticketRelationships?.length ? ticketRelationships : []}/>
						</> : null
					) : <LoadingSpinner/>}
				</div>
				<div className = "tw-space-y-2">
					{!isTicketCommentsLoading ? (
						<>
							<strong>Activity</strong>
							<TicketCommentForm ticketComments={ticketComments?.length ? ticketComments : []}/>
						</>
					) : <LoadingSpinner/>}
				</div>
			</div>
		</div>
	)	
}