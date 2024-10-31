import React, {useState} from "react"
import { AsyncSelect } from "../AsyncSelect"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller } from "react-hook-form"
import { TICKET_URL } from "../../helpers/urls" 
import { useAddTicketRelationshipMutation } from "../../services/private/ticket"
import { addToast } from "../../slices/toastSlice"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"

type Props = {
	childTicketId: number | string | undefined
}

type FormValues = {
	parentTicketId: number | string
}

export const AddToEpicFormModal = ({childTicketId}: Props) => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { ticketRelationshipTypes } = useAppSelector((state) => state.ticketRelationshipType)
	const dispatch = useAppDispatch()
	const epicTicketType = ticketTypes.find((ticketType) => ticketType.name === "Epic")
	const epicTicketRelationshipType = ticketRelationshipTypes.find((ticketRelationshipType) => ticketRelationshipType.name === "Epic")
	const [ addTicketRelationship, { error: addTicketRelationshipError, isLoading: isAddTicketRelationshipLoading }] = useAddTicketRelationshipMutation()

	const defaultForm = {
		parentTicketId: "",
	}

	const registerOptions = {
		parentTicketId: { required: "Epic Ticket is required"},
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
		if (childTicketId){
	    	try {
		    	await addTicketRelationship({
		    		parentTicketId: Number(values.parentTicketId) ?? 0,
		    		childTicketId: Number(childTicketId) ?? 0,
		    		ticketRelationshipTypeId: Number(epicTicketRelationshipType?.id) ?? 0
			    	}).unwrap()
			    	dispatch(addToast({
			    		...defaultToast,
			    		message: "Ticket linked successfully!",
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
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<p>Add To Epic</p>		
			<form className = "tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				<Controller
					name={"parentTicketId"}
					control={control}
	                render={({ field: { onChange, value, name, ref } }) => (
	                	<AsyncSelect 
		                	endpoint={TICKET_URL} 
		                	urlParams={{excludeAddedEpicParent: true, searchBy: "title", ticketType: epicTicketType?.id}} 
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
