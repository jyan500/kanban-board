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
import { TIME_DISPLAY_FORMAT, TIME_DISPLAY_INPUT_MASK, TIME_DISPLAY_PLACEHOLDER } from "../../helpers/constants"
import { 
	validateTimeFormat, 
	convertMinutesToTimeDisplay, 
	convertTimeDisplayToMinutes 
} from "../../helpers/functions"
import { IconContext } from "react-icons"
import { LuClock as ClockIcon } from "react-icons/lu";

type FormValues = {
	id?: number
	minutesSpent: string
	description: string
}

export type TicketActivityModalProps = {
	ticketId: number
	ticketActivityId?: number
	totalTime?: number
}

export const TicketActivityModal = ({ticketId, ticketActivityId, totalTime}: TicketActivityModalProps) => {
	const dispatch = useAppDispatch()
	const defaultForm = {
		id: 0,  
		minutesSpent: "00w 0d 00h 00m",
		description: "",
	}

	const [preloadedFormValues, setPreloadedFormValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedFormValues
	})
	const { register , control, handleSubmit, reset, setValue, watch, formState: {errors} } = methods
	const {data: ticketActivity, isLoading, isError} = useGetTicketActivityQuery(ticketActivityId ? {ticketId: ticketId, activityId: ticketActivityId} : skipToken)
	const [addTicketActivity, {isLoading: isAddTicketActivityLoading, error: addTicketActivityError}] = useAddTicketActivityMutation()
	const [updateTicketActivity, {isLoading: isUpdateTicketActivityLoading, error: updateTicketActivityError}] = useUpdateTicketActivityMutation()
	const registerOptions = {
		minutesSpent: {
			required: "Time Spent is required",
			validate: validateTimeFormat,
		},
		description: {required: "Description is required"}
	}

	/* Ensure that the values for week, day, hour, minute fall within constraints while the user is typing */
	const parseValueForConstraints = (value: string) => {
	    const match = value.match(TIME_DISPLAY_FORMAT);

	    if (match) {
		    let weeks = parseInt(match[1])
		    let days = parseInt(match[2])
		    let hours = parseInt(match[3])
		    let minutes = parseInt(match[4])
	    	// Ensure constraints
		    days = Math.min(days, 6)
		    hours = Math.min(hours, 23)
		    minutes = Math.min(minutes, 59)

	    	return `${weeks.toString().padStart(2, "0")}w ${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`
	    }

	    return value
	};


	useEffect(() => {
		if (ticketActivity){
			reset({
				id: ticketActivity.id,
				// include leading zeroes on the time display
				minutesSpent: convertMinutesToTimeDisplay(ticketActivity.minutesSpent, true),
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
					await addTicketActivity({
						ticketId: ticketId,
						body: {
							minutesSpent: convertTimeDisplayToMinutes(values.minutesSpent),
							description: values.description,
						}
					}).unwrap()
				}
				else {
					await updateTicketActivity({
						ticketId: ticketId, 
						body: {
							id: ticketActivityId,
							minutesSpent: convertTimeDisplayToMinutes(values.minutesSpent),
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
			{
				totalTime ? ( 
					<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-border tw-p-1">
						<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
							<IconContext.Provider value={{color: "var(--bs-primary)", className: "tw-w-4 tw-h-4"}}>
								<ClockIcon/>	
							</IconContext.Provider>
							<p className = "tw-font-bold">Total Time Spent</p>
						</div>
						<p>{convertMinutesToTimeDisplay(totalTime)}</p>
					</div>
				) : null 
			}
			<p>Please use the following format: </p>	
			<ul>
				<li>w = weeks</li>
				<li>d = days</li>
				<li>h = hours</li>
				<li>m = minutes</li>
			</ul>
			<small>Note that values cannot exceed the following: <span className = "tw-font-bold">99w 6d 23h 59m</span></small>
		
			<form className="tw-flex tw-flex-col tw-gap-y-2" onSubmit={handleSubmit(onSubmit)}>
				<div>
					<label className = "label" htmlFor = "time-spent">Time Spent</label>
					<Controller
						name={"minutesSpent"}
						control={control}
						rules={registerOptions.minutesSpent}
						render={({ field: { onChange, value } }) => {
							return (
								<InputMask
									onPaste={(e) => e.preventDefault()}
									id={"time-spent"}
									type="text"
								    mask={TIME_DISPLAY_INPUT_MASK}
								    placeholder={TIME_DISPLAY_PLACEHOLDER}
								    value={value}
								    onChange={(e) => {
								    	setValue("minutesSpent", parseValueForConstraints(e.target.value))
								    }}
							    />		
						    )
						}}
					/>
					{/* 
						This is a hack in order to get multiple error messages to show as React Hook Form doesn't have an easy way
						of displaying multiple error messages for the same field and same validation type.
					*/}
			        {errors?.minutesSpent && <small className = "--text-alert" dangerouslySetInnerHTML={{ __html: errors.minutesSpent.message ?? ""}}></small>}
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
