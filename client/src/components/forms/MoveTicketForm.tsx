import React, {useState, useEffect} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { BOARD_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { toggleShowModal, setModalProps } from "../../slices/modalSlice"
import { OptionType, Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useAddBoardTicketsMutation, useDeleteBoardTicketMutation } from "../../services/private/board"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Label } from "../page-elements/Label"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

type Props = {
	ticketId?: number | string | undefined
	boardId: number | string | null | undefined
	onSubmit?: (values: FormValues) => void
	title: string
	buttonBar?: React.ReactNode
	numSelectedIssues?: number
	formValues?: FormValues
	step?: number 
}

export type FormValues = {
	boardIdOption: OptionType
	shouldUnlink: boolean
}

export const MoveTicketForm = ({step, title, boardId: currentBoardId, ticketId, onSubmit: propsOnSubmit, buttonBar, numSelectedIssues, formValues}: Props) => {
	const dispatch = useAppDispatch()
	const [addBoardTickets, {isLoading: addBoardTicketsLoading, error: addBoardTicketsErrors}] = useAddBoardTicketsMutation()
	const [deleteBoardTicket, {isLoading: deleteBoardTicketLoading, error: deleteBoardTicketErrors}] = useDeleteBoardTicketMutation()
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const [submitLoading, setSubmitLoading] = useState(false)

	const defaultForm = {
		boardIdOption: {value: "", label: ""},
		shouldUnlink: false,
	}

	const registerOptions = {
		boardIdOption: { required: "Board is required"},
    }

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	useEffect(() => {
		if (step && formValues){
			reset(formValues)
		}
	}, [step, formValues])

	const onSubmit = async (values: FormValues) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while moving ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		setSubmitLoading(true)
		if (ticketId){
			const { value: boardId } = values.boardIdOption
	    	try {
		    	await addBoardTickets({boardId: !isNaN(Number(boardId)) ? Number(boardId) : 0, ticketIds: [!isNaN(Number(ticketId)) ? Number(ticketId) : 0]}).unwrap()
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
		setSubmitLoading(false)	
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
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-flex tw-flex-col tw-gap-y-0.5">
				<p className = {`${PRIMARY_TEXT} tw-font-bold`}>{title}</p>		
				<span className = {`${SECONDARY_TEXT} tw-text-xs`}><span className = "tw-font-semibold">{numSelectedIssues ? numSelectedIssues : ""}</span> Issue(s) will be copied to the selected board below.</span>
			</div>
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(propsOnSubmit ? propsOnSubmit : onSubmit)}>
				<Controller
					name={"boardIdOption"}
					control={control}
					rules={registerOptions.boardIdOption}
	                render={({ field: { onChange, value, name, ref } }) => (
	                	<AsyncSelect 
		                	endpoint={BOARD_URL} 
		                	cacheKey={cacheKey}
		                	className={"tw-w-64"}
		                	urlParams={{ignoreBoard: currentBoardId}} 
		                	defaultValue={formValues ? formValues.boardIdOption : undefined}
		                	onSelect={(selectedOption: {label: string, value: string} | null) => {
		                		onChange(selectedOption) 	
		                	}}
		                />
	                )}
				/>
		        {errors?.boardIdOption && <small className = "--text-alert">{errors.boardIdOption.message}</small>}
				{currentBoardId ? (
					<>
						<span className = {`${SECONDARY_TEXT} tw-text-xs`}>Select this to remove the issue(s) from the current board after copying</span>
						<div className = "tw-flex tw-flex-row tw-gap-x-2">
							<input id = "should-unlink" type = "checkbox" {...register("shouldUnlink")}/>
							<Label htmlFor="should-unlink">Unlink from current board</Label>	
						</div>
					</>
				) : null}
				<div>
					{
						buttonBar ? buttonBar : <LoadingButton isLoading={addBoardTicketsLoading || deleteBoardTicketLoading} type = "submit" text="Submit"/>
					}
				</div>
			</form>
		</div>
	)		
}
