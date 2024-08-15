import React, {useState, useEffect} from "react"
import { IconContext } from "react-icons"
import "../styles/ticket-display-form.css"
import { CgProfile } from "react-icons/cg"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { LoadingSpinner } from "./LoadingSpinner"
import { 
	useGetTicketAssigneesQuery, 
	useUpdateTicketMutation, 
	useBulkEditTicketAssigneesMutation 
} from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
import { useForm, FormProvider } from "react-hook-form"
import { Ticket, TicketType, Priority, UserProfile } from "../types/common"
import { FormValues } from "./TicketForm" 
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions"
import { TicketCommentForm } from "./TicketCommentForm"
import { priorityIconMap, ticketTypeIconMap, colorMap } from "./Ticket"

type EditFieldVisibility = {
	[key: string]: boolean
}

export const TicketDisplayForm = () => {
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
		className = {`${editFieldVisibility.assignees ? "" : "--invisible"} __table-select`}
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
		className = {`${editFieldVisibility["ticket-type"] ? "" : "--invisible"} __table-select`}
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
		className = {`${editFieldVisibility["priority"] ? "" : "--invisible"} __table-select`}
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
		<div className = "ticket-display-container">
			<FormProvider {...methods}>
				<form>
					<div className = "ticket-body">
						<div className = "ticket-main">
							<div className = "tw-pb-2">
							{
								!editFieldVisibility.name ? (
									<div onClick = {(e) => toggleFieldVisibility("name", true)} className = "__ticket-display-field __ticket-title">
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
							<div className = "__ticket-description">
								<strong>Description</strong>
								<>
									{
										!editFieldVisibility.description ? (
											<div onClick = {(e) => toggleFieldVisibility("description", true)} className = "__ticket-display-field">
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
						<div className = "ticket-sidebar">
							<select 
							{...register("statusId", registerOptions.statusId)} 
							onChange={(e) => {
								setValue("statusId", parseInt(e.target.value))
							    handleSubmit(onSubmit)()
							}}
							className = "status-select">
								{statusesToDisplay.map((status) => {
										return (
											<option key = {status.id} value = {status.id}>{status.name}</option>
										)
									})
								}
							</select>
							<div className = "ticket-details-container">
								<div className = "ticket-details">
									<table className = "__table">
										<tbody>
											<tr>
												<td colSpan = {2}>Details</td>
											</tr>
											<tr>
												<td>Assignee</td>
												<td>
												{!isTicketAssigneesLoading ? (
													<div onClick={(e) => {
														toggleFieldVisibility("assignees", true)
													}}
													className = "__ticket-display-field icon-container"
													>
														<CgProfile className = "--l-icon"/>
														{userProfileSelect}	
													</div>
												): <LoadingSpinner/>}
												</td>
											</tr>
											<tr>
												<td>Reporter</td>
												<td>
													<div className = "icon-container">
														<CgProfile className = "--l-icon"/>
														<div className = "--reporter">{displayUser(reporter)}</div>
													</div>
												</td>
											</tr>
											<tr>
												<td>Priority</td>
												<td className = "__table-display-field" onClick={(e) => {toggleFieldVisibility("priority", true)}}>
													<div className = "icon-container">
														<IconContext.Provider value = {{color: priorityName && priorityName in colorMap ? colorMap[priorityName] : "", className: "--l-icon"}}>
															{priorityName && priorityName in priorityIconMap ? priorityIconMap[priorityName] : null}	
														</IconContext.Provider>
														{prioritySelect}
													</div>
												</td>
											</tr>
											<tr>
												<td>Ticket Type</td>
												<td className = "__table-display-field" onClick={(e) => {toggleFieldVisibility("ticket-type", true)}}>
													<div className = "icon-container">
														<div className = "tw-ml-1.5">
															{ticketTypeName && ticketTypeName in ticketTypeIconMap ? ticketTypeIconMap[ticketTypeName] : null}
														</div>
														{ticketTypeSelect}
													</div>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div className = "tw-pt-2 tw-pb-2"><span>Created {createdAt}</span></div>
						</div>
					</div>
				</form>
			</FormProvider>
			<TicketCommentForm/>
		</div>
	)	
}