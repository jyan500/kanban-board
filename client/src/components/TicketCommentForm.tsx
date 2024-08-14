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
import { FormValues } from "./TicketForm" 
import { addToast } from "../slices/toastSlice" 
import { v4 as uuidv4 } from "uuid"
import { displayUser } from "../helpers/functions" 

type CommentFormValues = {
	id?: number
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

	const { data: ticketComments, isLoading } = useGetTicketCommentsQuery(currentTicketId ?? skipToken)

	const defaultForm = {
		id: 0,
		comment: ""
	}
	const [preloadedValues, setPreloadedValues] = useState<CommentFormValues>(defaultForm)
	const { register , handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<CommentFormValues>({
		defaultValues: preloadedValues
	})

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
							<textarea cols={15} rows={3}></textarea>
							<div className = "btn-group">
								<button>Save</button>
								<button onClick = {() => setShowAddCommentForm(false)} className = "--secondary">Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)) : null}
			<div>
				{ticketComments?.map((comment: TicketComment) => (
					<div className = "__comment">
						<CgProfile className = "--l-icon"/>
						{showEditCommentId === comment.id ? (
							<div>
								<form>
									<textarea cols={15} rows={3}>{comment.comment}</textarea>
									<div className = "btn-group">
										<button>Save</button>
										<button onClick = {() => {
											setShowAddCommentField(true)
											setShowEditCommentId(undefined)
										}} className = "--secondary">Cancel</button>
									</div>
								</form>
							</div>
						) : (
							<div>
								<div className = "btn-group">
									<span>{displayUser(userProfiles.find(userProfile => userProfile.id === comment.userId))}</span>
									<span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</span>
								</div>
								<p>{comment.comment}</p>
								{comment.userId === userProfile?.id && !showAddCommentForm ? (
									<div className = "btn-group">
										<button onClick={() => {
											setShowAddCommentField(false)
											setShowEditCommentId(comment.id)
										}}>Edit</button>
										<button className = "--alert">Delete</button>
									</div>
								) : null}
							</div>
						)}
					</div>
				))}
			</div>	
		</div>
	)
}