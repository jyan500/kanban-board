import React from "react"
import { useFormContext, FormProvider, SubmitHandler } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { TicketType, Priority } from "../../types/common"

export const Filters = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const methods = useFormContext()
	const { register } = methods
	return (
		<div className = "tw-flex tw-flex-row tw-gap-x-2">
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<label className = "label" htmlFor = "filters-ticket-type">Ticket Type</label>
				<select className = "tw-w-full" id = "filters-ticket-type" {...register("ticketType")}>
					<option value="" disabled></option>
					{ticketTypes.map((ticketType: TicketType) => {
						return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
					})}
				</select>
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<label className = "label" htmlFor = "filters-ticket-priority">Priority</label>
				<select className = "tw-w-full" id = "filters-ticket-priority" {...register("priority")}>
					<option value="" disabled></option>
					{priorities.map((priority: Priority) => {
						return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
					})}
				</select>
			</div>
		</div>
	)
}