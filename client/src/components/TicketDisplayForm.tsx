import React, {useState, useEffect} from "react"
import "../styles/ticket-display-form.css"
import { CgProfile } from "react-icons/cg"
import { useAppSelector } from "../hooks/redux-hooks"
import { LoadingSpinner } from "./LoadingSpinner"
import { useGetTicketAssigneesQuery } from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
import { useForm, FormProvider } from "react-hook-form"
import { Ticket, TicketType, Priority, UserProfile } from "../types/common"
import { FormValues } from "./TicketForm" 

type EditFieldVisibility = {
	[key: string]: boolean
}

export const TicketDisplayForm = () => {
	const {
		tickets,
		currentTicketId,
		statusesToDisplay
	} = useAppSelector((state) => state.board)
	const { statuses } = useAppSelector((state) => state.status)
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const { priorities } = useAppSelector((state) => state.priority) 
	const { ticketTypes } = useAppSelector((state) => state.ticketType) 
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const ticket = tickets.find((ticket) => ticket.id === currentTicketId)
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
		userId: 0 
	}	
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , setValue, watch, formState: {errors} } = methods
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

	const displayUser = (id: number | undefined) => {
		const user = userProfiles.find((user) => user.id === id)
		return user ? (user.firstName + " " + user.lastName) : ""
	}

	const userProfileSelect = ( 
		<select {...register("userId", registerOptions.userId)} onChange = {(e) => {
			toggleFieldVisibility("assignee", false)
		}}
		onBlur = {(e) => toggleFieldVisibility("assignee", false)}
		>
			{userProfiles.map((profile: UserProfile) => {
				return <option disabled={
					(profile.userRoleId === adminRole?.id || profile.userRoleId === boardAdminRole?.id) && 
					(userProfile?.userRoleId !== adminRole?.id && userProfile?.userRoleId !== boardAdminRole?.id)} key = {profile.id} value = {profile.id}>{profile.firstName + " " + profile.lastName}</option>
			})}
		</select>
	)

	const ticketTypeSelect = (
		<select {...register("ticketTypeId", registerOptions.ticketTypeId)} onChange = {(e) => {
			toggleFieldVisibility("ticket-type", false)
		}} onBlur = {(e) => toggleFieldVisibility("ticket-type", false)}>
			{ticketTypes?.map((ticketType: TicketType) => {
				return (
					<option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
				)
			})}
		</select>
	)

	const prioritySelect = (
		<select {...register("priorityId", registerOptions.priorityId)} onChange = {(e) => {
			toggleFieldVisibility("ticket-type", false)
		}} onBlur = {(e) => toggleFieldVisibility("priority", false)}>
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
							<>
							{
								!editFieldVisibility.name ? (
									<div onClick = {(e) => toggleFieldVisibility("name", true)} className = "__ticket-display-field __ticket-title">
										{ticket?.name}
									</div>
								) : (
									<>
										<InlineEdit registerField = {"name"} registerOptions = {registerOptions.name} type = "text" value={ticket?.name ?? ""} setValue={(value: string) => console.log("test")} onCancel={() => {toggleFieldVisibility("name", false)}}/>
								        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
							        </>
								)
							}
							</>
							<div className = "__ticket-description">
								<strong>Description</strong>
								<>
									{
										!editFieldVisibility.description ? (
											<div onClick = {(e) => toggleFieldVisibility("description", true)} className = "__ticket-display-field">
												{ticket?.description}
											</div>
										) : (
											<>
												<InlineEdit registerField = {"description"} registerOptions = {registerOptions.description} type = "textarea" value={ticket?.description ?? ""} setValue={(value: string) => console.log("test")} onCancel={() => toggleFieldVisibility("description", false)}/>
										        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
											</>
										)
									}
								</>
							</div>
						</div>
						<div className = "ticket-sidebar">
							<select {...register("statusId", registerOptions.statusId)} className = "__select">
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
												{!isTicketAssigneesLoading ? (ticketAssignees?.length === 0 ? (
													<>
														{!editFieldVisibility.assignees ? (
															<span onClick = {(e) => toggleFieldVisibility("assignees", true)} className = "__ticket-display-field">No Assignees</span>
														) : (
															userProfileSelect
														)}
													</>
												) : (
													<>
														{!editFieldVisibility.assignees ? (
															<div onClick = {(e) => toggleFieldVisibility("assignees", true)} className = "__ticket-display-field icon-container">
																<CgProfile className = "--l-icon"/>
																{displayUser(watch("userId"))}
															</div>) : (
															userProfileSelect
														)}
													</>
												)): <LoadingSpinner/>}
												</td>
											</tr>
											<tr>
												<td>Reporter</td>
												<td>
													<div className = "icon-container"><CgProfile className = "--l-icon"/>{reporter?.firstName} {reporter?.lastName}</div>
												</td>
											</tr>
											<tr>
												<td>Priority</td>
												<td>
													{
														!editFieldVisibility["priority"] ? (
															<div onClick = {(e) => toggleFieldVisibility("priority", true)} className = "__ticket-display-field">
																{priorities.find((priority) => priority.id === watch("priorityId"))?.name}
															</div>
														) : (
															prioritySelect
														)	
													}
												</td>
											</tr>
											<tr>
												<td>Ticket Type</td>
												<td>
													{
														!editFieldVisibility["ticket-type"] ? (
															<div onClick = {(e) => toggleFieldVisibility("ticket-type", true)} className = "__ticket-display-field">
																{ticketTypes.find((ticketType) => ticketType.id === watch("ticketTypeId"))?.name}
															</div>
														) : (
															ticketTypeSelect
														)
													}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<div><span>Created yesterday</span></div>
						</div>
					</div>
				</form>
			</FormProvider>
			<div className = "ticket-comments">
				<div>
					<div className = "__comment">
						<CgProfile className = "--l-icon"/>
						<div>
							<div>
								<span>UserName #2</span>
								<span>10 minutes ago</span>
							</div>
							<p>My first comment ...</p>
							<div>
								<span>Edit</span>
								<span>Delete</span>
							</div>
						</div>
					</div>
					<div className = "__comment">
						<CgProfile className = "--l-icon"/>
						<div>
							<div>
								<span>UserName #1</span>
								<span></span>
							</div>
							<p>My Second comment ...</p>
							<div>
								<span>Edit</span>
								<span>Delete</span>
							</div>
						</div>
					</div>
				</div>	
			</div>
		</div>
	)	
}