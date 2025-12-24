import React, {useEffect, useState} from "react"
import { IconButton } from "../page-elements/IconButton"
import { IconCircleCheckmark } from "../icons/IconCircleCheckmark"
import { BulkActionsFormStep1 } from "./BulkActionsFormStep1" 
import { BulkActionsFormStep2 } from "./BulkActionsFormStep2" 
import { BulkActionsFormStep3 } from "./BulkActionsFormStep3" 
import { BulkActionsFormStep4 } from "./BulkActionsFormStep4" 
import { BulkActionsFormStepIndicator } from "./BulkActionsFormStepIndicator"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useAddBoardTicketsMutation, useDeleteBoardTicketsMutation } from "../../services/private/board"
import { useBulkEditTicketsMutation, useBulkWatchTicketsMutation } from "../../services/private/ticket"
import { useAddNotificationMutation, useBulkCreateNotificationsMutation } from "../../services/private/notification"
import { OptionType, Ticket, Toast } from "../../types/common"
import { addToast } from "../../slices/toastSlice"
import { TICKETS } from "../../helpers/routes"
import { v4 as uuidv4 } from "uuid"

interface Props {
	boardId: number | null | undefined
	initSelectedIds: Array<number> 
	initStep: number
}

export interface BulkEditOperation {
	key: string
	text: string
	description: string
}

export type BulkEditOperationKey = "move-issues" | "edit-issues" | "remove-issues" | "watch-issues" | "stop-watching-issues"

export interface BulkEditFormValues {
	selectedTicketIds?: Array<number>
	currentBoardId?: string | number | null | undefined
	[key: string]: any
}


export const BulkActionsForm = ({boardId, initStep=1, initSelectedIds=[]}: Props) => {
	const [step, setStep] = useState(initStep)
	const [submitLoading, setSubmitLoading] = useState(false)
	const dispatch = useAppDispatch()
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const [selectedIds, setSelectedIds] = useState<Array<number>>(initSelectedIds)
	const [operation, setOperation] = useState<BulkEditOperationKey | null | undefined>(null)
	const [formValues, setFormValues] = useState<BulkEditFormValues>({})
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole != null && userRole !== "" && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")
	const [addBoardTickets, {isLoading: addBoardTicketsLoading, error: addBoardTicketsErrors}] = useAddBoardTicketsMutation()
	const [deleteBoardTickets, {isLoading: deleteBoardTicketsLoading, error: deleteBoardTicketsErrors}] = useDeleteBoardTicketsMutation()
	const [bulkEditTickets, {isLoading: bulkEditTicketsLoading, error: bulkEditTicketsError}] = useBulkEditTicketsMutation()
	const [bulkWatchTickets, {isLoading: bulkWatchTicketsLoading, error: bulkWatchTicketsError}] = useBulkWatchTicketsMutation()
	const [addNotification, {isLoading: addNotificationLoading, error: addNotificationError}] = useAddNotificationMutation()
	const [bulkCreateNotifications, { isLoading: bulkNotificationsLoading, error: bulkNotificationsError }] = useBulkCreateNotificationsMutation()
	const bulkWatchNotificationType = notificationTypes?.find((type) => type.name === "Bulk Watching")
	const bulkAssignNotificationType = notificationTypes?.find((type) => type.name === "Bulk Assigned")
	const unassignedNotificationType = notificationTypes?.find((notif) => notif.name === "Ticket Unassigned")
	const steps = [
		{step: 1, text: "Choose Issues"},
		{step: 2, text: "Choose Operation"},
		{step: 3, text: "Operation Details"},
		{step: 4, text: "Confirmation"},
	]
	const skipStep3 = operation === "remove-issues" || operation === "watch-issues" || operation === "stop-watching-issues"

	const operations: Array<BulkEditOperation> = [
		{
			key: "edit-issues",
			text: "Edit Issues",
			description: "Edit Field Values of Issues",
		},
		{
			key: "move-issues",
			text: "Move Issues",
			description: "Move issues to new boards",
		},
		{
			key: "remove-issues",
			text: "Remove Issues",
			description: "Remove issues from the board",
		},
		{
			key: "watch-issues",
			text: "Watch Issues",
			description: "Watch all selected issues",
		},
		{
			key: "stop-watching-issues",
			text: "Stop Watching Issues",
			description: "Stop watching all selected issues"
		}
	]

	const editIssues = async (selectedTickets: Array<Ticket>) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while editing tickets.",
			animationType: "animation-in",
			type: "failure"
		}	
		const { priorityId, statusId, userIdOption } = formValues
		try {
			const assigneeId: number | null = !isNaN(Number(userIdOption?.value)) ? Number(userIdOption?.value) : null
			await bulkEditTickets({ticketIds: selectedIds, priorityId, statusId, userIds: assigneeId != null ? [assigneeId] : []}).unwrap()
			// no need to send the notification if you're assigning the tickets to yourself
			if (userProfile && assigneeId === 0 && unassignedNotificationType && selectedTickets){
				// notify the user that they are unassigned from the ticket
				const notifications = selectedTickets.map((ticket) => {
					if (ticket.assignees?.[0]?.id){
						return {
							recipientId: ticket.assignees[0].id,
							senderId: userProfile.id,
							ticketId: ticket.id,
							objectLink: `${TICKETS}/${ticket.id}`,
							notificationTypeId: unassignedNotificationType.id,
						}
					}
				}).filter((notification) => notification != null)
				await bulkCreateNotifications(notifications).unwrap()
			}
			else if (userProfile && assigneeId && assigneeId !== userProfile.id && bulkAssignNotificationType){
				await addNotification({
					senderId: userProfile.id,
					recipientId: assigneeId,
					numTickets: selectedIds.length,
					notificationTypeId: bulkAssignNotificationType.id,	
				}).unwrap()
			}
			dispatch(addToast({
				...defaultToast,
				message: `${selectedIds.length} tickets edited successfully!`,
				type: "success"
			}))
		}
		catch (e){
			dispatch(addToast(defaultToast))
			return false
		}
		return true
	} 

	const moveIssues = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while moving tickets.",
			animationType: "animation-in",
			type: "failure"
		}
    	try {
		    	await addBoardTickets({boardId: formValues?.boardIdOption?.value ?? 0, ticketIds: selectedIds}).unwrap()
		    	if (boardId && formValues?.shouldUnlink){
			    	await deleteBoardTickets({boardId: boardId, ticketIds: selectedIds}).unwrap()
		    	}
		    	dispatch(addToast({
		    		...defaultToast,
		    		message: `${selectedIds.length} tickets moved successfully!`,
		    		type: "success"
		    	}))			    	
	    	}
    	catch (e){
    		dispatch(addToast(defaultToast))
    		return false
    	}
    	return true
	}

	const removeIssues = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while moving tickets.",
			animationType: "animation-in",
			type: "failure"
		}
		if (boardId){
			try {
				await deleteBoardTickets({boardId: boardId, ticketIds: selectedIds}).unwrap()
				dispatch(addToast({
					...defaultToast,
					message: `${selectedIds.length} tickets removed from board successfully!`,
					type: "success"
				}))
			}
			catch (e){
				dispatch(addToast(defaultToast))	
			}
		}
		else {
			dispatch(addToast(defaultToast))	
			return false
		}
		return true
	}

	const watchIssues = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while watching tickets.",
			animationType: "animation-in",
			type: "failure"
		}
		if (userProfile && selectedIds.length){
			try {
				await bulkWatchTickets({userId: userProfile.id, ticketIds: selectedIds, toAdd: true}).unwrap()
				if (bulkWatchNotificationType){
					await addNotification({
						senderId: userProfile.id,
						recipientId: userProfile.id,
						numTickets: selectedIds.length,
						notificationTypeId: bulkWatchNotificationType.id,	
					}).unwrap()
				}
				dispatch(addToast({
					...defaultToast,
					message: `You are now watching ${selectedIds.length} tickets!`,
					type: "success"
				}))
			}
			catch (e){
				dispatch(addToast(defaultToast))	
				return false
			}
		}
		else {
			dispatch(addToast(defaultToast))	
			return false
		}
		return true
	}

	const stopWatchingIssues = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while un-watching tickets.",
			animationType: "animation-in",
			type: "failure"
		}
		if (userProfile && selectedIds.length){
			try {
				await bulkWatchTickets({userId: userProfile.id, ticketIds: selectedIds, toAdd: false}).unwrap()
				dispatch(addToast({
					...defaultToast,
					message: `You have stopped watching ${selectedIds.length} tickets!`,
					type: "success"
				}))
			}
			catch (e){
				dispatch(addToast(defaultToast))	
				return false
			}
		}
		else {
			dispatch(addToast(defaultToast))	
			return false
		}
		return true
	}

	const onSubmit = async (selectedTickets: Array<Ticket>) => {
		setSubmitLoading(true)
		let isSuccess = false
		switch (operation){
			case "edit-issues":
				isSuccess = await editIssues(selectedTickets)
				break
			case "move-issues":
				isSuccess = await moveIssues()
				break
			case "remove-issues":
				isSuccess = await removeIssues()
				break
			case "watch-issues":
				isSuccess = await watchIssues()
				break
			case "stop-watching-issues":
				isSuccess = await stopWatchingIssues()
				break
		}
		setSubmitLoading(false)
		if (isSuccess){
			closeModal()
		}
	}


	const closeModal = () => {
		dispatch(toggleShowModal(false))
		dispatch(setModalType(undefined))
		dispatch(setModalProps({}))
	}

	const renderStep = () => {
		switch (step){
			case 1:
				return <BulkActionsFormStep1 
					step={step} 
					setStep={setStep} 
					selectedIds={selectedIds} 
					setSelectedIds={setSelectedIds} 
					boardId={boardId}
					closeModal={closeModal}
				/>
			case 2:
				return <BulkActionsFormStep2 
					isAdminOrBoardAdmin={isAdminOrBoardAdmin ?? false}
					step={step} 
					setStep={setStep}
					numSelectedIssues={selectedIds.length}
					setOperation={setOperation}
					operation={operation}
					operations={operations}
					skipStep3={skipStep3}
				/>
			case 3:
				return <BulkActionsFormStep3 
					formValues={formValues} 
					setFormValues={setFormValues} 
					selectedIds={selectedIds} 
					boardId={boardId} 
					operation={operation} 
					step={step} 
					setStep={setStep}
				/>
			case 4:
				return <BulkActionsFormStep4 
					skipStep3={skipStep3}
					onSubmit={onSubmit} 
					operation={operation} 
					operations={operations} 
					setSelectedIds={setSelectedIds} 
					selectedIds={selectedIds} 
					setStep={setStep} 
					step={step} 
					formValues={formValues}
					isSubmitLoading={submitLoading}
				/>
		}	
	}


	return (
		<div className = "tw-flex tw-flex-col tw-w-full">
			<h1>Bulk Actions</h1>	
			<div className = "tw-flex tw-flex-col lg:tw-flex-row">
				<div className = "lg:tw-w-1/4">
					<ol>
						{steps.map((s) => 
							<BulkActionsFormStepIndicator disabled={s.step === 3 && skipStep3} key={s.step} Icon={<IconCircleCheckmark color={step > s.step ? "var(--bs-success)" : ""}/>} step = {s.step} setStep={setStep} currentStep = {step} text = {s.text}/>
						)}
					</ol>
				</div>
				<div className = "lg:tw-w-3/4">
					{
						renderStep()
					}	
				</div>
			</div>
		</div>
	)
}
