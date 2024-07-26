import React, {useState} from "react"
import "../styles/ticket-display-form.css"
import { CgProfile } from "react-icons/cg"
import { useAppSelector } from "../hooks/redux-hooks"
import { LoadingSpinner } from "./LoadingSpinner"
import { useGetTicketAssigneesQuery } from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
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
	const { userProfiles } = useAppSelector((state) => state.userProfile)
	const { priorities } = useAppSelector((state) => state.priority) 
	const { ticketTypes } = useAppSelector((state) => state.ticketType) 
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
	const ticket = tickets.find((ticket) => ticket.id === currentTicketId)
	const reporter = userProfiles?.find((user) => user.id === ticket?.userId)
	const priority = priorities.find((priority) => priority.id === ticket?.priorityId)
	const ticketType = ticketTypes.find((type) => type.id === ticket?.ticketTypeId)
	const [editFieldVisibility, setEditFieldVisibility] = useState<EditFieldVisibility>({
		"name": false,
		"description": false,
		"assignees": false
	})
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		description: "",
		priorityId: 0,
		statusId: 0,
		ticketTypeId: 0,
		userId: 0 
	}	
	const [form, setForm] = useState<FormValues>(ticket as FormValues ?? defaultForm)
	return (
		<div className = "ticket-display-container">
			<div className = "ticket-body">
				<div className = "ticket-main">
					<>
					{
						!editFieldVisibility.name ? (
							<div onClick = {(e) => setEditFieldVisibility({...editFieldVisibility, name: true})} className = "__ticket-title --l-text">
								{ticket?.name}
							</div>
						) : (
							<InlineEdit value={ticket?.name ?? ""} setValue={(value: string) => setForm({...form, name: value})} onCancel={() => {setEditFieldVisibility({...editFieldVisibility, name: false})}}/>
						)
					}
					</>
					<div className = "__ticket-description">
						<strong>Description</strong>
						<p>{ticket?.description}</p>
					</div>
				</div>
				<div className = "ticket-sidebar">
					<select value = {ticket?.statusId} className = "__select">
						{statusesToDisplay.map((status) => {
								return (
									<option  key = {status.id} value = {status.id}>{status.name}</option>
								)
							})
						}
					</select>
					<div className = "ticket-details-container">
						<div className = "ticket-details">
							<table className = "__table">
								<tr>
									<td colSpan = {2}>Details</td>
								</tr>
								<tr>
									<td>Assignee</td>
									<td>
									{!isTicketAssigneesLoading ? (ticketAssignees?.length === 0 ? (<span>No Assignees</span>) : (
										<div className = "icon-container">
											<CgProfile className = "--l-icon"/>
											{ticketAssignees?.[0].firstName} {ticketAssignees?.[0].lastName}
										</div>)): <LoadingSpinner/>}
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
									<td>{priority?.name}</td>
								</tr>
								<tr>
									<td>Ticket Type</td>
									<td>{ticketType?.name}</td>
								</tr>
							</table>
						</div>
					</div>
					<div><span>Created yesterday</span></div>
				</div>
			</div>
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