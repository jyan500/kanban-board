import React, {useState} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { TICKET_ASSIGNEE_URL, USER_PROFILE_URL } from "../../helpers/urls" 
import { addToast } from "../../slices/toastSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { 
	useAddTicketAssigneeMutation,
	useDeleteTicketAssigneeMutation, 
} from "../../services/private/ticket"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"

type Props = {
	ticketId: number | undefined
}

type FormValues = {
	userId: number | string
}

export const AddTicketWatchersModal = ({ticketId}: Props) => {
	const [cacheKey, setCacheKey] = useState(uuidv4())
	const dispatch = useAppDispatch()
	const [ addTicketAssignee, {isLoading: addTicketAssigneeLoading} ] = useAddTicketAssigneeMutation()
	const [ deleteTicketAssignee, {isLoading: isDeleteTicketAssigneeLoading}] = useDeleteTicketAssigneeMutation()

	const defaultForm = {
		userId: "",
	}

	const registerOptions = {
		userId: { required: "User is required"},
    }

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register, control, handleSubmit, reset, setValue, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	const onSubmit = async (values: FormValues) => {
		let defaultToast: Toast = {
			id: uuidv4(),
			message: "Something went wrong while linking ticket.",
			animationType: "animation-in",
			type: "failure"
		}
		if (ticketId){
	    	try {
		    	await addTicketAssignee({
		    		ticketId: ticketId,
		    		userIds: [Number(values.userId) ?? 0],
		    		isWatcher: true
			    	}).unwrap()
			    	dispatch(addToast({
			    		...defaultToast,
			    		message: "Ticket watcher added successfully!",
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
    	dispatch(toggleShowSecondaryModal(false))
    	dispatch(setSecondaryModalType(undefined))
    	dispatch(setSecondaryModalProps({}))
    	// flush cached options after submitting
    	setCacheKey(uuidv4())
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<p className = "tw-font-bold">Add Watchers</p>		
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				<Controller
					name={"userId"}
					control={control}
	                render={({ field: { onChange, value, name, ref } }) => (
	                	<AsyncSelect 
		                	endpoint={USER_PROFILE_URL} 
		                	cacheKey={cacheKey}
		                	className={"tw-w-64"}
		                	urlParams={{}} 
		                	onSelect={(selectedOption: {label: string, value: string} | null) => {
		                		onChange(selectedOption?.value ?? "") 	
		                	}}
		                />
	                )}
				/>
				{/*<AsyncSelect endpoint={TICKET_URL} urlParams={{searchBy: "title", ticketType: epicTicketType?.id}} onSelect={handleSelect}/>*/}
				<button className = "button">Submit</button>
			</form>
		</div>
	)		
}
