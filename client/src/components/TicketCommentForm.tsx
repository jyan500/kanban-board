import React, {useState, useEffect} from "react"
import { CgProfile } from "react-icons/cg"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { LoadingSpinner } from "./LoadingSpinner"
import { 
	useGetTicketCommentsQuery,
	useAddTicketCommentMutation,
	useUpdateTicketCommentMutation,
	useDeleteTicketCommentMutation
} from "../services/private/ticket"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { InlineEdit } from "./InlineEdit" 
import { useForm, useFormContext, FormProvider } from "react-hook-form"
import { Ticket, TicketType, TicketComment, UserProfile } from "../types/common"
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions" 
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"
import { DeleteCommentWarningProps } from "./secondary-modals/DeleteCommentWarning"
import { LoadingButton } from "./page-elements/LoadingButton"

type CommentFormValues = {
	id: number
	ticketId: number,
	userId: number,
	comment: string
}

type CommentFieldProps = {
	registerOptions: Record<string, any>
	isLoading: boolean
	onSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void 
	onCancel: () => void
}

export const CommentField = ({isLoading, registerOptions, onSubmit, onCancel}: CommentFieldProps) => {
	const { handleSubmit, register, resetField, setValue, formState: {errors} } = useFormContext<CommentFormValues>()
	return (
		<form className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full">
			<textarea {...register("comment", registerOptions)} className = "tw-w-full" rows={8}></textarea>
	        {errors?.comment && <small className = "--text-alert">{errors.comment.message}</small>}
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton isLoading={isLoading} className = "button" text={"Save"} onClick={onSubmit}></LoadingButton>
				<button onClick = {onCancel} className = "button --secondary">Cancel</button>
			</div>
		</form>
	)
}

type TicketCommentFormProps = {
	ticketComments: Array<TicketComment>
}

/* 
Add new comment on ticket, and displays existing comments for the ticket
*/
export const TicketCommentForm = ({ticketComments}: TicketCommentFormProps) => {
	const dispatch = useAppDispatch()
	const {
		tickets,
		currentTicketId,
		statusesToDisplay
	} = useAppSelector((state) => state.board)	
	const { showModal } = useAppSelector(state => state.modal)
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 

	// const { data: ticketComments, isLoading: isTicketCommentsLoading } = useGetTicketCommentsQuery(currentTicketId ?? skipToken)
	const [ addTicketComment, {isLoading: isAddTicketCommentLoading, error: isAddTicketCommentError }] = useAddTicketCommentMutation()
	const [ updateTicketComment, {isLoading: isUpdateTicketCommentLoading, error: isUpdateTicketCommentError }] = useUpdateTicketCommentMutation()
	const [ deleteTicketComment, {isLoading: isDeleteTicketCommentLoading, error: isDeleteTicketCommentError }] = useDeleteTicketCommentMutation()

	const defaultForm = {
		id: 0,
		ticketId: 0,
		userId: 0,
		comment: ""
	}
	const [preloadedValues, setPreloadedValues] = useState<CommentFormValues>(defaultForm)
	const methods = useForm<CommentFormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset, setValue, watch, formState: {errors} } = methods
	const registerOptions = {
	    comment: { required: "Comment is required" },
    }
	/* 
	Because only one comment can exist on the form at once, the 
	behavior is as follows:
	1) if the add comment button is clicked, the add comment form appears
	2) If adding a comment, the edit and delete buttons on all existing comments will disappear
	3) if editing an existing comment, the edit comment field will appear for that comment, and no other
	edit comment fields should appear. The add comment field should disappear when editing an existing comment
	*/
	const [showAddCommentField, setShowAddCommentField] = useState(true)
	const [showAddCommentForm, setShowAddCommentForm] = useState(false)
	const [showEditCommentId, setShowEditCommentId] = useState<number | undefined>()

	const adminRole = userRoles?.find((role) => role.name === "ADMIN")
	const boardAdminRole = userRoles?.find((role) => role.name === "BOARD_ADMIN")


	const onSubmit = async (values: CommentFormValues) => {
		try {
			if (values.id === 0 && currentTicketId && userProfile){
				const data = await addTicketComment(
				{
					ticketId: currentTicketId,
					comment: {
						comment: values.comment,
						ticketId: currentTicketId,
						userId: userProfile.id
					}
				}).unwrap()
			}
			else {
				await updateTicketComment(
				{
					ticketId: values.ticketId,
					comment: values
				}
				).unwrap()
			}
			dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Comment ${values.id !== 0 ? "updated" : "added"} successfully!`,
    		}))
		}
		catch (e){
			dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to submit comment`,
    		}))
		}
	}

	const onDelete = async (commentId: number) => {
		try {
			if (currentTicketId && commentId){
				await deleteTicketComment({ticketId: currentTicketId, commentId}).unwrap()
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: `Comment deleted successfully!`,
	    		}))
			}
			else {
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: `Failed to delete comment`,
	    		}))	
			}
		}
		catch (e) {
			dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to delete comment`,
    		}))
		}
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-overflow-y-auto tw-max-h-[calc(var(--l-modal-height)/2)]">
			{
				showAddCommentField ? (!showAddCommentForm ? (
					<div className = "tw-flex tw-flex-row tw-items-start tw-gap-x-2">
						<CgProfile className = "tw-w-8 tw-h-8"/>	
						<button onClick = {() => setShowAddCommentForm(true)} className = "tw-bg-gray-50 tw-p-1 tw-w-[400px] tw-border tw-border-gray-300"><i>Add a comment...</i></button>
					</div>
				) : (
					<div className = "tw-flex tw-flex-row tw-items-start tw-gap-x-2 tw-w-full">
						<CgProfile className = "tw-w-8 tw-h-8"/>
						<FormProvider {...methods}>
							<CommentField 
								isLoading={isAddTicketCommentLoading}
								registerOptions={registerOptions.comment}
								onSubmit={async (e) => {
									e.preventDefault()
									await handleSubmit(onSubmit)()
									if (!Object.keys(errors).length){
										setShowAddCommentForm(false)
										reset(defaultForm)
									}
								}} 
								onCancel={() => {
									setShowAddCommentForm(false)
									reset(defaultForm)
								}}
							/>
						</FormProvider>
					</div>
				)) : null
			}
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					ticketComments?.map((comment: TicketComment) => (
						<div key = { comment.id } className = "tw-flex tw-flex-row tw-items-start tw-gap-x-2">
							<CgProfile className = "tw-w-8 tw-h-8"/>
							<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full">
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<span>{displayUser(userProfiles.find(userProfile => userProfile.id === comment.userId))}</span>
									<span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>
								</div>
								{showEditCommentId === comment.id ? (
									<FormProvider {...methods}>
										<CommentField
										isLoading={isUpdateTicketCommentLoading}
										registerOptions={registerOptions.comment}
										onSubmit={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
											e.preventDefault()
											await handleSubmit(onSubmit)()
											if (!Object.keys(errors).length){
												setShowEditCommentId(undefined)
												setShowAddCommentField(true)
												reset(defaultForm)
											}
										}}
										onCancel={() => {
											reset(defaultForm)
											setShowAddCommentField(true)
											setShowEditCommentId(undefined)
										}}
										/>
									</FormProvider>
								) : (
									<p>{comment.comment}</p>
								)}
								{comment.userId === userProfile?.id && !showAddCommentForm && !showEditCommentId ? (
									<div className = "tw-flex tw-flex-row tw-gap-x-2">
										<button className = "button" onClick={() => {
											reset({
												id: comment.id,
												ticketId: comment.ticketId,
												userId: comment.userId,
												comment: comment.comment
											})
											setShowAddCommentField(false)
											setShowEditCommentId(comment.id)
										}}>Edit</button>
										{/*<button onClick={() => onDelete(comment.id)} className = "button --alert">Delete</button>*/}
										<button onClick={() => {
											dispatch(toggleShowSecondaryModal(true))
											dispatch(setSecondaryModalProps<DeleteCommentWarningProps>({ticketId: currentTicketId ?? undefined, commentId: comment.id}))
											dispatch(setSecondaryModalType("SHOW_DELETE_COMMENT_WARNING"))
										}} className = "button --alert">Delete</button>
									</div>
								) : null}
							</div>
						</div>
					))
				}
			</div>	
		</div>
	)
}