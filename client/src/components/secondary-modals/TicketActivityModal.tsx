import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller, FormProvider } from "react-hook-form"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Toast } from "../../types/common"
import InputMask from "react-input-mask"
import { SimpleEditor } from "../page-elements/SimpleEditor"
import { useGetTicketActivityQuery, useAddTicketActivityMutation, useUpdateTicketActivityMutation } from "../../services/private/ticket"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"

type FormValues = {
	id?: number
	timeSpent: string
	description: string
}

type Props = {
	ticketId: number
	ticketActivityId?: number
}

export const TicketActivityModal = ({ticketId, ticketActivityId}: Props) => {
	const dispatch = useAppDispatch()
	const defaultForm = {
		id: 0,  
		timeSpent: "",
		description: "",
	}

	const [preloadedFormValues, setPreloadedFormValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedFormValues})
	const { register , control, handleSubmit, reset, setValue, watch, formState: {errors} } = methods
	const {data: ticketActivity, isLoading, isError} = useGetTicketActivityQuery(ticketActivityId ? {ticketId: ticketId, activityId: ticketActivityId} : skipToken)
	const [addTicketActivity, {isLoading: isAddTicketActivityLoading, error: addTicketActivityError}] = useAddTicketActivityMutation()
	const [updateTicketActivity, {isLoading: isUpdateTicketActivityLoading, error: updateTicketActivityError}] = useUpdateTicketActivityMutation()
	const registerOptions = {
		timeSpent: {required: "Time Spent is required"},
		description: {required: "Description is required"}
	}

	useEffect(() => {
		if (ticketActivity){
			reset({
				id: ticketActivity.id,
				timeSpent: "",
				description: ticketActivity.description,
			})
		}
	}, [ticketActivity])

	const onSubmit = async (values: FormValues) => {
		const toast: Toast = {
			id: uuidv4(),
			message: "Ticket activity was saved successfully!",
			animationType: "animation-in",
			type: "success",
		}
		if (ticketId){
			try {
				if (!ticketActivityId){
					console.log("add ticket activity")
					await addTicketActivity({
						ticketId: ticketId,
						body: {
							minutesSpent: 0,
							description: values.description,
						}
					}).unwrap()
				}
				else {
					await updateTicketActivity({
						ticketId: ticketId, 
						body: {
							id: ticketActivityId,
							minutesSpent: 0,
							description: values.description,
						}
					}).unwrap()
				}
				dispatch(addToast(toast))
			}
			catch (err){
				dispatch(addToast({
					...toast,
					type: "failure",
					message: "Something went wrong when saving ticket activity"
				}))
			}
		}
		else {
			dispatch(addToast({
				...toast,
				type: "failure",
				message: "Something went wrong when saving ticket activity"
			}))	
		}

		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalType(undefined))
		dispatch(setSecondaryModalProps({}))
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-justify-center">
			<h2>Time Tracking</h2>
			<p>Please use the following format: </p>	
			<ul>
				<li>w = weeks</li>
				<li>d = days</li>
				<li>h = hours</li>
				<li>m = minutes</li>
			</ul>
			<form className="tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				<div>
					<label className = "label" htmlFor = "time-spent">Time Spent</label>
					<Controller
						name={"timeSpent"}
						control={control}
						rules={registerOptions.timeSpent}
						render={({ field: { onChange, value } }) => {
							return (
								<InputMask
									onPaste={(e) => e.preventDefault()}
									id={"time-spent"}
									type="text"
								    mask="99w 9d 99h 99m"
								    value={value}
								    onChange={onChange}
							    />		
						    )
						}}
					/>
			        {errors?.timeSpent && <small className = "--text-alert">{errors.timeSpent.message}</small>}
				</div>
				<div>
					<label className = "label">Description</label>
					<FormProvider {...methods}>
						<SimpleEditor
							registerField={"description"}
							registerOptions={registerOptions.description}
							mentionsEnabled={false}
						/>
					</FormProvider>
			        {errors?.description && <small className = "--text-alert">{errors.description.message}</small>}
				</div>
				<div>
					<button type="submit" className = "button">Submit</button>
				</div>
			</form>
		</div>
	)
}