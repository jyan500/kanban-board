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
import { Ticket, TicketType, Priority, Status, UserProfile } from "../types/common"
import { FormValues } from "./AddTicketForm" 
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions"
import { TicketCommentForm } from "./TicketCommentForm"
import { LinkedTicketForm } from "./LinkedTicketForm"
import { EditTicketFormToolbar } from "./EditTicketFormToolbar" 
import { priorityIconMap, TicketTypeIcon , colorMap } from "./Ticket"
import { EditTicketFormMenuDropdown } from "./EditTicketFormMenuDropdown" 
import { ImTree as AddToEpicIcon } from "react-icons/im";
import { Badge } from "./page-elements/Badge"
import { PaginationRow } from "./page-elements/PaginationRow"
import { Link } from "react-router-dom"
import { TICKETS } from "../helpers/routes"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 


type EditFieldVisibility = {
	[key: string]: boolean
}

type Props = {
	ticket: Ticket | null | undefined
	statusesToDisplay: Array<Status>
	isModal?: boolean
}

export const EditTicketForm = ({isModal, ticket, statusesToDisplay}: Props) => {
	const dispatch = useAppDispatch()
	const currentTicketId = ticket?.id
	const { statuses } = useAppSelector((state) => state.status)
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const { priorities } = useAppSelector((state) => state.priority) 
	const { ticketTypes } = useAppSelector((state) => state.ticketType) 
	const [ epicTicketPage, setEpicTicketPage ] = useState(1)
	const [ linkedTicketPage, setLinkedTicketPage ] = useState(1)
	const [ commentPage, setCommentPage ] = useState(1)
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ?? skipToken)
	const { data: ticketComments, isLoading: isTicketCommentsLoading } = useGetTicketCommentsQuery(currentTicketId ? {ticketId: currentTicketId, params: {page: commentPage}} : skipToken)
	const { data: ticketRelationships, isLoading: isTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ? 
		{ticketId: currentTicketId, params: {page: linkedTicketPage, isEpic: false}} : skipToken
	)
	const { data: epicTicketRelationships, isLoading: isEpicTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ? 
		{ticketId: currentTicketId, params: {page: epicTicketPage, isEpic: true}} : skipToken
	)
	const [ updateTicket, {isLoading: isUpdateTicketLoading, error: isUpdateTicketError} ] = useUpdateTicketMutation() 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const isCompletedStatusIds = statuses.filter((status) => status.isCompleted).map((status) => status.id)
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
	const [showAddToEpic, setShowAddToEpic] = useState(false)
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
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
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
			setShowAddToEpic(false)
		}
		// initialize with current values if the ticket exists
		if (currentTicketId){
			reset({...ticket, userId: ticketAssignees?.length ? ticketAssignees[0].id : 0} ?? defaultForm)
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, currentTicketId])

	useEffect(() => {
		if (!isTicketAssigneesLoading){
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
			{ticketTypes?.filter((ticketType) => ticketType?.id !== epicTicketType?.id).map((ticketType: TicketType) => {
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
		<div className = "tw-flex tw-flex-col tw-w-full tw-gap-y-2">
			<FormProvider {...methods}>
				<form onSubmit={(e) => {e.preventDefault()}}>
					<div className = "tw-flex tw-flex-row tw-gap-x-4">
						<div className = "tw-break-words tw-w-2/3 tw-flex tw-flex-col tw-gap-y-2">
							<div>
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
							<div className = "tw-flex tw-flex-row tw-gap-x-2">
								<button onClick={(e) => {
									e.preventDefault()	
									setShowAddLinkedIssue(!showAddLinkedIssue)
								}} className = "button !tw-bg-secondary">
									<div className = "icon-container">
										<IconContext.Provider value = {{className: "icon"}}>
											<LinkIcon/>
										</IconContext.Provider>
										<span>Link Issue</span>
									</div>
								</button>
								{
									epicTicketType?.id === ticket?.ticketTypeId ? 
									(
										<button onClick={(e) => {
										e.preventDefault()	
										setShowAddToEpic(!showAddToEpic)
										}} className = "button !tw-bg-light-purple">
											<div className = "icon-container">
												<IconContext.Provider value = {{className: "icon"}}>
													<AddToEpicIcon/>
												</IconContext.Provider>
												<span>Add To Epic</span>
											</div>
										</button>
									) : null
								}
							</div>
							<div className = "">
								<strong>Description</strong>
								<>
									{
										!editFieldVisibility.description ? (
											<div onClick = {(e) => toggleFieldVisibility("description", true)} className = "hover:tw-opacity-60 tw-cursor-pointer">
												<span>{watch("description")}</span>
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
							<EditTicketFormToolbar ticket={ticket}/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<select 
								{...register("statusId", registerOptions.statusId)} 
								onChange={(e) => {
									setValue("statusId", parseInt(e.target.value))
								    handleSubmit(onSubmit)()
								}}
								style={{
									background: ticket && isCompletedStatusIds.includes(ticket.statusId) ? "var(--bs-success)" : "var(--bs-primary)",
									borderColor: ticket && isCompletedStatusIds.includes(ticket.statusId) ? "var(--bs-success)" : "var(--bs-primary)"
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
										{
											<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => {toggleFieldVisibility("ticket-type", true)}}>
												{ticketTypeName ? <TicketTypeIcon type={ticketTypeName} className = "tw-ml-1.5 tw-w-6 tw-h-6 tw-shrink-0"/> : null}
												{
													epicTicketType?.id !== ticket?.ticketTypeId ?
														<div className = "tw-w-full tw-ml-0.5">
														{ticketTypeSelect}
														</div>
													: (
													<div className = "tw-ml-3.5">
														{ticketTypeName}	
													</div>
													)
												}
											</div>
									}
									</div>
								</div>
							</div>
							<div className = "tw-flex tw-flex-row tw-gap-x-2">
							{
								ticket?.epicParentTickets?.map((parentTicket) => {
									return (
										<Link key={`edit_ticket_parent_epic_link_${parentTicket.id}`} onClick = {() => {
											// if we're in a modal, close the modal first
											if (isModal){
												dispatch(toggleShowModal(false))
												dispatch(selectCurrentTicketId(null))
											}
										}} to = {`${TICKETS}/${parentTicket.id}`}>
											<Badge key = {`edit_ticket_parent_epic_${parentTicket.id}`} className = {"tw-bg-light-purple tw-text-white"}><span className = "tw-text-sm">{parentTicket.name}</span></Badge>  
										</Link>
									)
								})
							} 
							</div> 
							<div className = "tw-pt-2 tw-pb-2">
								<strong>Created {createdAt}</strong>
							</div>
						</div>
					</div>
				</form>
			</FormProvider>
			<div className = "tw-flex tw-flex-col tw-break-words tw-w-2/3 tw-gap-y-2">
				<div className = "tw-space-y-2">
					{!isTicketRelationshipsLoading ? (
						currentTicketId && (setShowAddLinkedIssue || ticketRelationships?.data?.length) ? 
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{ticket?.ticketTypeId === epicTicketType?.id ? (
								<>
									<strong>Epic Tickets</strong>
									<LinkedTicketForm isModal={isModal} currentTicketId={currentTicketId} isEpicParent={true} showAddLinkedIssue={showAddToEpic} setShowAddLinkedIssue={setShowAddToEpic} ticketRelationships={epicTicketRelationships?.data?.length ? epicTicketRelationships.data : []}/>
									<PaginationRow
										showNumResults={false}
										showPageNums={false}
										setPage={(page: number) => { setEpicTicketPage(page)}}	
										paginationData={epicTicketRelationships?.pagination}
										currentPage={epicTicketPage}
									/>
								</>
							) : null
							}
							<strong>Linked Issues</strong>	
							<LinkedTicketForm currentTicketId={currentTicketId} showAddLinkedIssue={showAddLinkedIssue} setShowAddLinkedIssue={setShowAddLinkedIssue} ticketRelationships={ticketRelationships?.data?.length ? ticketRelationships.data : []}/>
							<PaginationRow
								showNumResults={false}
								showPageNums={false}
								setPage={(page: number) => { setLinkedTicketPage(page)}}	
								paginationData={ticketRelationships?.pagination}
								currentPage={linkedTicketPage}
							/>
						</div> : null
					) : <LoadingSpinner/>}
				</div>
				<div className = "tw-space-y-2">
					{!isTicketCommentsLoading && currentTicketId ? (
						<>
							<strong>Activity</strong>
							<TicketCommentForm currentTicketId={currentTicketId} ticketComments={ticketComments?.data?.length ? ticketComments.data : []}/>
						 	<PaginationRow
								showNumResults={false}
								showPageNums={false}
								setPage={(page: number) => { setCommentPage(page)} }	
								paginationData={ticketComments?.pagination}
								currentPage={commentPage}
							/>
						</>
					) : <LoadingSpinner/>}
				</div>
			</div>
		</div>
	)	
}