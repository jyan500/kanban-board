import React, {useState, useEffect} from "react"
import "../styles/ticket-comment-form.css"
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
import { useForm, FormProvider } from "react-hook-form"
import { Ticket, TicketType, TicketComment, UserProfile } from "../types/common"
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions" 

type CommentFormValues = {
	id: number
	ticketId: number,
	userId: number,
	comment: string
}

/* 
Add new comment on ticket, and displays existing comments for the ticket
*/
export const TicketCommentForm = () => {
	const dispatch = useAppDispatch()
	const {
		tickets,
		currentTicketId,
		statusesToDisplay
	} = useAppSelector((state) => state.board)	
	const { userProfile, userProfiles } = useAppSelector((state) => state.userProfile)
	const { userRoles } = useAppSelector((state) => state.userRole) 

	const { data: ticketComments, isLoading: isTicketCommentsLoading } = useGetTicketCommentsQuery(currentTicketId ?? skipToken)
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
	const { register , handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<CommentFormValues>({
		defaultValues: preloadedValues
	})
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
		<div className = "ticket-comments">
			{showAddCommentField ? (!showAddCommentForm ? (
				<div className = "__comment">
					<CgProfile className = "--l-icon"/>	
					<button onClick = {() => setShowAddCommentForm(true)} className = "--fake-input"><i>Add a comment...</i></button>
				</div>
			) : (
				<div className = "__comment">
					<CgProfile className = "--l-icon"/>
					<div>
						<form>
							<textarea {...register("comment")} cols={15} rows={3}></textarea>
					        {errors?.comment && <small className = "--text-alert">{errors.comment.message}</small>}
							<div className = "btn-group">
								<button onClick = {async (e) => {
									e.preventDefault()
									setShowAddCommentForm(false)
									await handleSubmit(onSubmit)()
									reset(defaultForm)
								}}>Save</button>
								<button onClick = {() => {
									setShowAddCommentForm(false)
									reset(defaultForm)
								}} className = "--secondary">Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)) : null}
			<div>
				{ticketComments?.map((comment: TicketComment) => (
					<div key = { comment.id } className = "__comment">
						<CgProfile className = "--l-icon"/>
						<div>
							<div className = "btn-group">
								<span>{displayUser(userProfiles.find(userProfile => userProfile.id === comment.userId))}</span>
								<span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>
							</div>
							{showEditCommentId === comment.id ? (
								<form>
									<textarea {...register("comment")} cols={15} rows={3}></textarea>
							        {errors?.comment && <small className = "--text-alert">{errors.comment.message}</small>}
									<div className = "btn-group">
										<button onClick={async (e) => {
											e.preventDefault()
											await handleSubmit(onSubmit)()
											setShowEditCommentId(undefined)	
											setShowAddCommentField(true)
											reset(defaultForm)
										}}>Save</button>
										<button onClick = {() => {
											reset(defaultForm)
											setShowAddCommentField(true)
											setShowEditCommentId(undefined)
										}} className = "--secondary">Cancel</button>
									</div>
								</form>
							) : (
								<p>{comment.comment}</p>
							)}
							{comment.userId === userProfile?.id && !showAddCommentForm && !showEditCommentId ? (
								<div className = "btn-group">
									<button onClick={() => {
										reset({
											id: comment.id,
											ticketId: comment.ticketId,
											userId: comment.userId,
											comment: comment.comment
										})
										setShowAddCommentField(false)
										setShowEditCommentId(comment.id)
									}}>Edit</button>
									<button onClick={() => onDelete(comment.id)} className = "--alert">Delete</button>
								</div>
							) : null}
						</div>
					</div>
				))}
			</div>	
		</div>
	)
}