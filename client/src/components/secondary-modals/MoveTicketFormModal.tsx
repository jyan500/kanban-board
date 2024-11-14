import React, {useState} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { BOARD_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { toggleShowModal, setModalProps } from "../../slices/modalSlice"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../../services/private/board"

type Props = {
	ticketId: number | string | undefined
	boardId: number | string | null | undefined
}

type FormValues = {
	boardId: number | string
	shouldUnlink: boolean
}

export const MoveTicketFormModal = ({boardId: currentBoardId, ticketId}: Props) => {
	const dispatch = useAppDispatch()
	const [addBoardTickets, {isLoading: addBoardTicketsLoading, error: addBoardTicketsErrors}] = useAddBoardTicketsMutation()
	const [deleteBoardTicket, {isLoading: deleteBoardTicketLoading, error: deleteBoardTicketErrors}] = useDeleteBoardTicketMutation()
	const [cacheKey, setCacheKey] = useState(uuidv4())

	const defaultForm = {
		boardId: "",
		shouldUnlink: false,
	}

	const registerOptions = {
		boardId: { required: "Board is required"},
    }

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	const onSubmit = async (values: FormValues) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while moving ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		if (ticketId){
	    	try {
			    	await addBoardTickets({boardId: !isNaN(Number(values.boardId)) ? Number(values.boardId) : 0, ticketIds: [!isNaN(Number(ticketId)) ? Number(ticketId) : 0]}).unwrap()
			    	if (currentBoardId && values.shouldUnlink){
				    	await deleteBoardTicket({boardId: !isNaN(Number(currentBoardId)) ? Number(currentBoardId) : 0, ticketId: !isNaN(Number(ticketId)) ? Number(ticketId) : 0}).unwrap()
			    	}
			    	dispatch(addToast({
			    		...defaultToast,
			    		message: "Ticket moved successfully!",
			    		type: "success"
			    	}))			    	
		    	}
		    	catch (e){
		    		dispatch(addToast(defaultToast))
		    	}
	    	}
    	else {
    		dispatch(addToast(defaultToast))
    	}
    	dispatch(setSecondaryModalType(undefined))
    	dispatch(toggleShowSecondaryModal(false))
    	dispatch(setSecondaryModalProps({}))
    	// also close the edit ticket form modal beneath this one if unlinking the current ticket
    	if (currentBoardId && values.shouldUnlink){
    		dispatch(toggleShowModal(false))
    		dispatch(setModalProps({}))
    	}
    	// flush async select options after submitting
    	setCacheKey(uuidv4())
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<p className = "tw-font-bold">Move Ticket</p>		
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				<Controller
					name={"boardId"}
					control={control}
	                render={({ field: { onChange, value, name, ref } }) => (
	                	<AsyncSelect 
		                	endpoint={BOARD_URL} 
		                	cacheKey={cacheKey}
		                	className={"tw-w-64"}
		                	urlParams={{ignoreBoard: currentBoardId}} 
		                	onSelect={(selectedOption: {label: string, value: string} | null) => {
		                		onChange(selectedOption?.value ?? "") 	
		                	}}
		                />
	                )}
				/>
				{currentBoardId ? (
					<div className = "tw-flex tw-flex-row tw-gap-x-2">
						<input id = "should-unlink" type = "checkbox" {...register("shouldUnlink")}/>
						<label className = "label" htmlFor="should-unlink">Unlink from current board</label>	
					</div>
				) : null}
				<button className = "button">Submit</button>
			</form>
		</div>
	)		
}
