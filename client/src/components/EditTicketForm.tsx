import React, {useState, useEffect} from "react"
import { IconContext } from "react-icons"
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
	useBulkEditTicketAssigneesMutation,
	useGetTicketActivitiesQuery,
} from "../services/private/ticket"
import { useGetUserQuery } from "../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
import { Controller, useForm, FormProvider } from "react-hook-form"
import { OptionType, Mention, Ticket, TicketType, Priority, Status, UserProfile } from "../types/common"
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
import { USER_PROFILE_URL } from "../helpers/urls"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"
import { AsyncSelect } from "./AsyncSelect"
import { TextAreaDisplay } from "./page-elements/TextAreaDisplay"
import { ActivityContainer } from "./ActivityContainer"
import { Avatar } from "./page-elements/Avatar"
import { useAddNotificationMutation, useBulkCreateNotificationsMutation } from "../services/private/notification"
import { useScreenSize } from "../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../helpers/constants"
import { isValidDateString, convertMinutesToTimeDisplay } from "../helpers/functions"
import { format, toDate } from "date-fns-tz"
import { TicketActivityModalProps } from "./secondary-modals/TicketActivityModal"

type EditFieldVisibility = {
	[key: string]: boolean
}

type Props = {
	ticket: Ticket | null | undefined
	boardId?: number | string | null | undefined
	statusesToDisplay: Array<Status>
	isModal?: boolean
}

type EditFormValues = FormValues & {
	storyPoints: number | string
	dueDate: string
}

type RightSectionRowProps = {
	title: string
	children: React.ReactNode
}

const RightSectionRow = ({children, title}: RightSectionRowProps) => {
	return (
		<div className = "tw-flex tw-flex-row tw-w-full tw-items-center tw-min-h-9">	
			<span className = "tw-font-semibold tw-w-1/2">{title}</span>
			{children}
		</div>
	)
}

export const EditTicketForm = ({isModal, boardId, ticket, statusesToDisplay}: Props) => {
	const dispatch = useAppDispatch()
	const currentTicketId = ticket?.id
	const { statuses } = useAppSelector((state) => state.status)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 
	const { priorities } = useAppSelector((state) => state.priority) 
	const { notificationTypes } = useAppSelector((state) => state.notificationType) 
	const { ticketTypes } = useAppSelector((state) => state.ticketType) 
	const [ epicTicketPage, setEpicTicketPage ] = useState(1)
	const [ linkedTicketPage, setLinkedTicketPage ] = useState(1)
	const [ commentPage, setCommentPage ] = useState(1)
	const [ activityPage, setActivityPage ] = useState(1)
	const { data: reporter, isLoading: isUserLoading } = useGetUserQuery(ticket?.userId ?? skipToken)
	const { data: ticketAssignees, isLoading: isTicketAssigneesLoading } = useGetTicketAssigneesQuery(currentTicketId ? {ticketId: currentTicketId, params: {isWatcher: false, isMention: false}} : skipToken)
	const { data: ticketWatchers, isLoading: isTicketWatchersLoading } = useGetTicketAssigneesQuery(currentTicketId ? {ticketId: currentTicketId, params: {isWatcher: true, isMention: false}} : skipToken)
	const { data: ticketComments, isLoading: isTicketCommentsLoading } = useGetTicketCommentsQuery(currentTicketId ? {ticketId: currentTicketId, params: {page: commentPage, perPage: 5}} : skipToken)
	const { data: ticketRelationships, isLoading: isTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ? 
		{ticketId: currentTicketId, params: {page: linkedTicketPage, isEpic: false}} : skipToken
	)
	const { data: epicTicketRelationships, isLoading: isEpicTicketRelationshipsLoading } = useGetTicketRelationshipsQuery(currentTicketId ? 
		{ticketId: currentTicketId, params: {page: epicTicketPage, includeEpicPercentageCompletion: true, isEpic: true}} : skipToken
	)
	const { data: ticketActivities, isLoading: isTicketActivitiesLoading } = useGetTicketActivitiesQuery(currentTicketId ? {ticketId: currentTicketId, params: {page: activityPage, includeTotalTime: true, perPage: 5}} : skipToken)
	const [ updateTicket, {isLoading: isUpdateTicketLoading, error: isUpdateTicketError} ] = useUpdateTicketMutation() 
	const [ bulkEditTicketAssignees ] = useBulkEditTicketAssigneesMutation()
	const [ addNotification, {isLoading: isAddNotificationLoading}] = useAddNotificationMutation()
	const [ bulkCreateNotifications, {isLoading: isBulkCreateNotificationLoading}] = useBulkCreateNotificationsMutation()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const isCompletedStatusIds = statuses.filter((status) => status.isCompleted).map((status) => status.id)
	const createdAt = ticket?.createdAt ? new Date(ticket?.createdAt).toLocaleDateString() : ""
	const mentionNotificationType = notificationTypes?.find((notif) => notif.name === "Mention")

	const [editFieldVisibility, setEditFieldVisibility] = useState<EditFieldVisibility>({
		"name": false,
		"description": false,
		"assignees": false,
		"priority": false,
		"ticket-type": false,
		"story-points": false,
		"due-date": false,
	})
	const [showAddLinkedIssue, setShowAddLinkedIssue] = useState(false)
	const [showAddToEpic, setShowAddToEpic] = useState(false)
	const defaultForm: EditFormValues = {
		id: 0,
		name: "",
		description: "",
		priorityId: 0,
		statusId: 0,
		ticketTypeId: 0,
		userId: 0,
		storyPoints: "",
		dueDate: "" 
	}	
	const [preloadedValues, setPreloadedValues] = useState<EditFormValues>(defaultForm)
	const methods = useForm<EditFormValues>({
		defaultValues: preloadedValues
	})
	const { register , control, handleSubmit, reset, resetField, setValue, watch, formState: {errors} } = methods
	const registerOptions = {
	    name: { required: "Name is required" },
    	description: { required: "Description is required"},
	    priorityId: { required: "Priority is required"},
	    statusId: { required: "Status is required"},
	    ticketTypeId: { required: "Ticket Type is required"},
	    dueDate: {},
	    storyPoints: {},
	    userId: {}
    }
    /* Get screen width and height */
    const { width, height } = useScreenSize()

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
				"ticket-type": false,
				"due-date": false,
				"story-points": false,
			})
			setShowAddLinkedIssue(false)
			setShowAddToEpic(false)
		}
		// initialize with current values if the ticket exists
		if (currentTicketId){
			reset({
				...ticket, 
				dueDate: ticket.dueDate != null && ticket.dueDate !== "" ? new Date(ticket.dueDate).toISOString().split("T")[0] : "",
				userId: ticketAssignees?.length ? ticketAssignees[0].id : 0
			} ?? defaultForm
			)
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

	const onSubmit = async (values: EditFormValues) => {
    	try {
    		// update existing ticket
    		if (values.id != null){
    			// update ticket assignees
    			// TODO: need to update this line to include all userIds if allowing multiple 
    			// assignees per ticket
    			if (values.userId){
	    			await bulkEditTicketAssignees({ticketId: values.id, userIds: [values.userId], isWatcher: false}).unwrap()
    			}
    			const { mentions } = await updateTicket({
    				...values, 
    				storyPoints: !isNaN(Number(values.storyPoints)) ? Number(values.storyPoints) : 0,
    				dueDate: values.dueDate ? new Date(values.dueDate) : "",  
    				id: values.id
    			}).unwrap()
    			if (mentionNotificationType && userProfile && mentions.length){
	    			const notifications = mentions.map((mention: Mention) => {
	    				return {
							recipientId: mention.userId,
							senderId: userProfile.id,
							ticketId: mention.ticketId,
							objectLink: `${TICKETS}/${mention.ticketId}`,
							notificationTypeId: mentionNotificationType.id,
						}
	    			})
					await bulkCreateNotifications(notifications).unwrap()
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
		<Controller
			name={"userId"}
			control={control}
            render={({ field: { onChange, value, name, ref } }) => (
            	<AsyncSelect 
                	endpoint={USER_PROFILE_URL} 
					className = {`tw-w-full ${editFieldVisibility["assignees"] ? "" : "!tw-border-transparent"}`}
                	clearable={false}
                	onBlur={(e) => toggleFieldVisibility("assignees", false)}
                	defaultValue={{value: ticketAssignees?.[0]?.id.toString() ?? "", label: displayUser(ticketAssignees?.[0]) ?? ""}}
                	urlParams={{forSelect: true, filterOnUserRole: true}} 
                	onSelect={async (selectedOption: {label: string, value: string} | null) => {
                		const val = selectedOption?.value ?? ""
                		if (!isNaN(Number(val))){
                			setValue("userId", Number(val))
                			toggleFieldVisibility("assignees", false)
                			await handleSubmit(onSubmit)()
                		}
                	}}
                />
            )}
		/>
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

	const rightSection = () => {
		return (
			<>
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
					className = "tw-w-full __custom-select">
						{statuses.map((status) => {
								return (
									<option key = {status.id} value = {status.id}>{status.name}</option>
								)
							})
						}
					</select>
					<div className = "tw-flex tw-flex-col tw-gap-y-2">
						<span className = "tw-font-bold tw-text-xl">Details</span>
						<RightSectionRow title={"Assignee"}>
							{
								!isTicketAssigneesLoading ? (
									<button className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => toggleFieldVisibility("assignees", true)}>
										<Avatar imageUrl={ticketAssignees?.[0]?.imageUrl} className = "tw-rounded-full tw-shrink-0"/>
										{userProfileSelect}		
									</button>
								) : <LoadingSpinner/>
							}	
						</RightSectionRow>
						<RightSectionRow title={"Reporter"}>
							<div className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center">
								<Avatar imageUrl={reporter?.imageUrl} className = "tw-rounded-full tw-shrink-0"/>
								<div className = "tw-ml-3.5">{displayUser(reporter)}</div>
							</div>
						</RightSectionRow>
						<RightSectionRow title={"Priority"}>
							<button className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => {toggleFieldVisibility("priority", true)}}>
								<IconContext.Provider value = {{color: priorityName && priorityName in colorMap ? colorMap[priorityName] : "", className: "tw-shrink-0 tw-w-8 tw-h-8"}}>
									{priorityName && priorityName in priorityIconMap ? priorityIconMap[priorityName] : null}	
								</IconContext.Provider>	
								{prioritySelect}
							</button>
						</RightSectionRow>
						<RightSectionRow title={"Ticket Type"}>
							{
								<button className = "tw-flex tw-gap-x-1 tw-flex-1 tw-flex-row tw-items-center" onClick={(e) => {toggleFieldVisibility("ticket-type", true)}}>
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
								</button>
							}
						</RightSectionRow>
						<RightSectionRow title={"Story Points"}>
							{
								!editFieldVisibility["story-points"] ? (
									<button onClick = {(e) => toggleFieldVisibility("story-points", true)} className = "hover:tw-opacity-60 tw-cursor-pointer">
										{watch("storyPoints") !== "" && watch("storyPoints") ? watch("storyPoints") : "None"}
									</button>
								) : (
									<>
										<InlineEdit 
											isLoading={isUpdateTicketLoading}
											mentionsEnabled={false}
											customReset={() => {
												if (ticket?.storyPoints){
													setValue("storyPoints", ticket.storyPoints)
												}
												else {
													setValue("storyPoints", "")
												}
											}}
											type="number"
											onSubmit = {async () => {
											await handleSubmit(onSubmit)()
											if (!errors?.storyPoints){
												toggleFieldVisibility("storyPoints", false)
											}
										}} registerField = {"storyPoints"} registerOptions = {registerOptions.storyPoints} value={watch("storyPoints")?.toString()} onCancel={() => {toggleFieldVisibility("story-points", false)}}/>
								        {errors?.storyPoints && <small className = "--text-alert">{errors.storyPoints.message}</small>}
							        </>
								)
							}
						</RightSectionRow>
						<RightSectionRow title={"Due Date"}>
							{
								!editFieldVisibility["due-date"] ? (
									<button onClick = {(e) => toggleFieldVisibility("due-date", true)} className = "hover:tw-opacity-60">
										{isValidDateString(watch("dueDate")) ? format(toDate(watch("dueDate")), "MM/dd/yyyy") : "None"}
									</button>
								) : (
									<>
										<InlineEdit 
											isLoading={isUpdateTicketLoading}
											mentionsEnabled={false}
											type="date"
											minDate={new Date().toISOString().split("T")[0]}
											customReset={() => {
												if (ticket?.dueDate){
													// TODO: Fix error where due date needs to be a string
													setValue("dueDate", new Date(ticket.dueDate).toISOString().split("T")[0])
												}
												else {
													setValue("dueDate", "")
												}
											}}
											onSubmit = {async () => {
												await handleSubmit(onSubmit)()
												if (!errors?.dueDate){
													toggleFieldVisibility("due-date", false)
												}
										}} registerField = {"dueDate"} registerOptions = {registerOptions.dueDate} value={watch("dueDate")} onCancel={() => {toggleFieldVisibility("due-date", false)}}/>
								        {errors?.dueDate && <small className = "--text-alert">{errors.dueDate.message}</small>}
							        </>
								)
							}
						</RightSectionRow>
						<RightSectionRow title={"Time Spent"}>
							<button className = "hover:tw-opacity-60" onClick={(e) => {
								dispatch(toggleShowSecondaryModal(true))
								dispatch(setSecondaryModalProps<TicketActivityModalProps>({
									...(!isTicketActivitiesLoading && ticketActivities?.additional?.totalTime ? {totalTime: ticketActivities?.additional?.totalTime} : {}), 
									ticketId: ticket?.id ?? 0
								}))
								dispatch(setSecondaryModalType("TICKET_ACTIVITY_MODAL"))
							}}>{!isTicketActivitiesLoading ? (ticketActivities?.additional?.totalTime ? convertMinutesToTimeDisplay(ticketActivities?.additional?.totalTime) : <span>None</span>) : <LoadingSpinner/>}</button>
						</RightSectionRow>
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
			</>
		)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-w-full tw-gap-y-2">
			<FormProvider {...methods}>
				<form onSubmit={(e) => {e.preventDefault()}}>
					<div className = "tw-flex tw-flex-col tw-gap-y-4 lg:tw-flex-row lg:tw-gap-x-4">
						<div className = "tw-break-words tw-w-full lg:tw-w-2/3 tw-flex tw-flex-col tw-gap-y-2">
							<div>
							{
								!editFieldVisibility.name ? (
									<div onClick = {(e) => toggleFieldVisibility("name", true)} className = "hover:tw-opacity-60 tw-cursor-pointer tw-font-bold tw-text-3xl">
										{watch("name")}
									</div>
								) : (
									<>
										<InlineEdit 
											isLoading={isUpdateTicketLoading}
											mentionsEnabled={false}
											customReset={() => {
												if (ticket?.name){
													setValue("name", ticket.name)
												}
											}}
											onSubmit = {async () => {
											await handleSubmit(onSubmit)()
											if (!errors?.name){
												toggleFieldVisibility("name", false)
											}
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
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<strong>Description</strong>
								<>
									{
										!editFieldVisibility.description ? (
											<div onClick = {(e) => toggleFieldVisibility("description", true)} className = "hover:tw-opacity-60 tw-cursor-pointer">
												<TextAreaDisplay rawHTMLString={watch("description")}/>
											</div>
										) : (
											<div className = "tw-flex tw-flex-col tw-gap-y-2">
												<InlineEdit 
													mentionsEnabled={true}
													customReset={() => {
														if (ticket?.description){
															setValue("description", ticket.description)
														}
													}}
													isLoading={isUpdateTicketLoading}
													onSubmit={async () => {
														await handleSubmit(onSubmit)()
														if (!errors?.description){
															toggleFieldVisibility("description", false)
														}
													}} 
													registerField = {"description"} 
													registerOptions = {registerOptions.description} 
													type = "textarea" 
													onCancel={() => toggleFieldVisibility("description", false)}/>
										        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
											</div>
										)
									}
								</>
							</div>
						</div>
						<div className = "tw-w-full tw-flex-col tw-flex tw-gap-y-2 lg:tw-w-1/3">
							{
								<>
									<div>
										<EditTicketFormToolbar ticketAssignee={ticketAssignees?.[0]} ticketWatchers={ticketWatchers} statusesToDisplay={statuses} boardId={boardId} ticket={ticket}/>
									</div>
									<div>{rightSection()}</div>	
								</>
							}
						</div>
					</div>
				</form>
			</FormProvider>
			<div className = "tw-flex tw-flex-col tw-break-words tw-w-full lg:tw-w-2/3 tw-gap-y-2">
				<div className = "tw-space-y-2">
					{!isTicketRelationshipsLoading ? (
						currentTicketId && (setShowAddLinkedIssue || ticketRelationships?.data?.length) ? 
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							{ticket?.ticketTypeId === epicTicketType?.id ? (
								<>
									<div className = "tw-flex tw-flex-row tw-justify-between">
										<strong>Epic Tickets</strong>
										{
											epicTicketRelationships?.pagination.nextPage || epicTicketRelationships?.pagination.prevPage ? (
												<PaginationRow
													showNumResults={false}
													showPageNums={false}
													setPage={(page: number) => { setEpicTicketPage(page)}}	
													paginationData={epicTicketRelationships?.pagination}
													currentPage={epicTicketPage}
												/>
											) : null
										}
									</div>
									<LinkedTicketForm percentageCompleted={epicTicketRelationships?.additional?.percentageCompleted} isModal={isModal} currentTicketId={currentTicketId} isEpicParent={true} showAddLinkedIssue={showAddToEpic} setShowAddLinkedIssue={setShowAddToEpic} ticketRelationships={epicTicketRelationships?.data?.length ? epicTicketRelationships.data : []}/>
								</>
							) : null
							}
							<strong>Linked Issues</strong>	
							{
								ticketRelationships?.pagination.nextPage || ticketRelationships?.pagination.prevPage ? (
									<PaginationRow
										showNumResults={false}
										showPageNums={false}
										setPage={(page: number) => { setLinkedTicketPage(page)}}	
										paginationData={ticketRelationships?.pagination}
										currentPage={linkedTicketPage}
									/>
								) : null
							}
							<LinkedTicketForm currentTicketId={currentTicketId} showAddLinkedIssue={showAddLinkedIssue} setShowAddLinkedIssue={setShowAddLinkedIssue} ticketRelationships={ticketRelationships?.data?.length ? ticketRelationships.data : []}/>
						</div> : null
					) : <LoadingSpinner/>}
				</div>
				<div className = "tw-space-y-2">
					{!isTicketCommentsLoading && !isTicketActivitiesLoading && currentTicketId ? (
						<ActivityContainer 
							ticketActivities={ticketActivities}
							activityPage={activityPage}
							setActivityPage={setActivityPage}
							ticketComments={ticketComments}
							setCommentPage={setCommentPage}
							commentPage={commentPage}
							currentTicketId={currentTicketId}
						/>
					) : <LoadingSpinner/>}
				</div>
			</div>
		</div>
	)	
}