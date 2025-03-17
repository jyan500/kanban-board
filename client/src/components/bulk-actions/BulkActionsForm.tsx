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
import { useBulkEditTicketsMutation } from "../../services/private/ticket"
import { OptionType, Toast } from "../../types/common"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

interface Props {
	boardId: number | null | undefined
}

export interface BulkEditOperation {
	key: string
	text: string
	description: string
}

export type BulkEditOperationKey = "move-issues" | "edit-issues" | "delete-issues" | "watch-issues" | "stop-watching-issues"

export interface BulkEditFormValues {
	selectedTicketIds?: Array<number>
	currentBoardId?: string | number | null | undefined
	[key: string]: any
}


export const BulkActionsForm = ({boardId}: Props) => {
	const [step, setStep] = useState(1)
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const [selectedIds, setSelectedIds] = useState<Array<number>>([])
	const [operation, setOperation] = useState<BulkEditOperationKey | null | undefined>(null)
	const [formValues, setFormValues] = useState<BulkEditFormValues>({})
	const userRole = userProfile && userRoleLookup ? userRoleLookup[userProfile?.userRoleId] : null
	const isAdminOrBoardAdmin = userRole != null && userRole !== "" && (userRole === "ADMIN" || userRole === "BOARD_ADMIN")
	const [addBoardTickets, {isLoading: addBoardTicketsLoading, error: addBoardTicketsErrors}] = useAddBoardTicketsMutation()
	const [deleteBoardTickets, {isLoading: deleteBoardTicketsLoading, error: deleteBoardTicketsErrors}] = useDeleteBoardTicketsMutation()
	const [bulkEditTickets, {isLoading: bulkEditTicketsLoading, error: bulkEditTicketsError}] = useBulkEditTicketsMutation()
	const steps = [
		{step: 1, text: "Choose Issues"},
		{step: 2, text: "Choose Operation"},
		{step: 3, text: "Operation Details"},
		{step: 4, text: "Confirmation"},
	]

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
			key: "delete-issues",
			text: "Delete Issues",
			description: "Permanently delete issues",
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

	const editIssues = async () => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while editing tickets.",
			animationType: "animation-in",
			type: "failure"
		}	
		const { priorityId, statusId, userIdOption } = formValues
		try {
			await bulkEditTickets({ticketIds: selectedIds, priorityId, statusId, userIds: userIdOption.value !== "" ? [userIdOption.value] : []}).unwrap()
			dispatch(addToast({
				...defaultToast,
				message: `${selectedIds.length} tickets edited successfully!`,
				type: "success"
			}))
		}
		catch (e){
			dispatch(addToast(defaultToast))
		}
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
    	}
	}

	const deleteIssues = async () => {

	}

	const watchIssues = async () => {

	}

	const stopWatchingIssues = async () => {

	}

	const onSubmit = () => {
		switch (operation){
			case "edit-issues":
				editIssues()
				break
			case "move-issues":
				moveIssues()
				break
			case "delete-issues":
				break
			case "watch-issues":
				break
			case "stop-watching-issues":
				break
		}
		closeModal()
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
					onSubmit={onSubmit} 
					operation={operation} 
					operations={operations} 
					setSelectedIds={setSelectedIds} 
					selectedIds={selectedIds} 
					setStep={setStep} 
					step={step} 
					formValues={formValues}
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
							<BulkActionsFormStepIndicator key={s.step} Icon={<IconCircleCheckmark color={step > s.step ? "var(--bs-success)" : ""}/>} step = {s.step} setStep={setStep} currentStep = {step} text = {s.text}/>
						)}
					</ol>
				</div>
				<div className = "tw-flex tw-flex-1">
					{
						renderStep()
					}	
				</div>
			</div>
		</div>
	)
}