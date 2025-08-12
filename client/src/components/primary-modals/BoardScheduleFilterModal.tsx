import React, { useState, useEffect } from "react"
import { TicketType, Priority, Status, OptionType } from "../../types/common"
import { Controller, useForm, FormProvider } from "react-hook-form"
import { AsyncSelect, LoadOptionsType } from "../AsyncSelect"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"

type FormValues = {
	priorityId: number | null
	statusId: number | null
	ticketTypeId: number | null
	userIdOption: OptionType | null
	startDate: Date | null
	endDate: Date | null
}

export const BoardScheduleFilterModal = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { filters } = useAppSelector((state) => state.boardSchedule)
	const defaultForm: FormValues = {
		ticketTypeId: 0,
		priorityId: 0,
		statusId: 0,
		userIdOption: {value: "", label: ""},
		startDate: new Date(),
		endDate: new Date()
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , control, setValue, getValues, watch, formState: {errors} } = methods

	return (
		<div>
			<p className = "tw-font-semibold tw-text-lg">Filters</p>	
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "filters-ticket-type">Ticket Type</label>
					<select className = "tw-w-full" id = "filters-ticket-type" {...register("ticketTypeId")}>
						<option value="" disabled></option>
						{ticketTypes.map((ticketType: TicketType) => {
							return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
						})}
					</select>
				</div>
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "filters-ticket-priority">Priority</label>
					<select className = "tw-w-full" id = "filters-ticket-priority" {...register("priorityId")}>
						<option value="" disabled></option>
						{priorities.map((priority: Priority) => {
							return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
						})}
					</select>
				</div>
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "filters-ticket-status">Status</label>
					<select className = "tw-w-full" id = "filters-ticket-status" {...register("statusId")}>
						<option value="" disabled></option>
						{statuses.map((status: Status) => {
							return <option key = {status.id} value = {status.id}>{status.name}</option>
						})}
					</select>
				</div>
			</div>
		</div>
	)	
}