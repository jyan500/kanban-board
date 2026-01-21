import React from "react"
import { useFormContext, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { TicketType, Priority, Status } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { BOARD_URL } from "../../helpers/urls"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Select } from "../page-elements/Select"

export const Filters = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const methods = useFormContext()
	const { watch, register, getValues, control } = methods
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-gap-x-2">
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "bulk-action-filters-ticket-type">Ticket Type</label>
				<Controller name={"ticketType"} control={control} render={({field: {onChange}}) => (
					<Select 
						options={ticketTypes.map((ticketType) => (
						{
							label: ticketType.name,
							value: ticketType.id.toString(),
						}
						))}
						defaultValue={watch("ticketType") ?? {value: "", label: ""}}
						onSelect={(selectedOption: {label: string, value: string} | null) => {
							onChange(selectedOption) 	
						}}
					/>
				)}>
				</Controller>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "bulk-action-filters-ticket-priority">Priority</label>
				<Controller name={"priority"} control={control} render={({field: {onChange}}) => (
					<Select 
						options={priorities.map((priority) => (
						{
							label: priority.name,
							value: priority.id.toString(),
						}
						))}
						defaultValue={watch("priority") ?? {value: "", label: ""}}
						onSelect={(selectedOption: {label: string, value: string} | null) => {
							onChange(selectedOption) 	
						}}
					/>
				)}>
				</Controller>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "bulk-action-filters-ticket-status">Status</label>
				<Controller name={"status"} control={control} render={({field: {onChange}}) => (
					<Select 
						options={statuses.map((status) => (
						{
							label: status.name,
							value: status.id.toString(),
						}
						))}
						defaultValue={watch("status") ?? {value: "", label: ""}}
						onSelect={(selectedOption: {label: string, value: string} | null) => {
							onChange(selectedOption) 	
						}}
					/>
				)}>
				</Controller>
			</div>
		</div>
	)
}
