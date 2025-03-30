import React from "react"
import { useFormContext, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { Board, TicketType, Priority, Status } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { BOARD_URL } from "../../helpers/urls"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"
import { useGetBoardQuery } from "../../services/private/board"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"

export const Filters = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const methods = useFormContext()
	const { register, getValues, watch, control } = methods
	const { data: boardInfo, isLoading, isError } = useGetBoardQuery(watch("board") ? {id: watch("board"), urlParams: {}} : skipToken)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-gap-x-2">
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-ticket-type">Ticket Type</label>
				<select className = "tw-w-full" id = "filters-ticket-type" {...register("ticketType")}>
					<option value="" disabled></option>
					{ticketTypes.map((ticketType: TicketType) => {
						return <option key = {ticketType.id} value = {ticketType.id}>{ticketType.name}</option>
					})}
				</select>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-ticket-priority">Priority</label>
				<select className = "tw-w-full" id = "filters-ticket-priority" {...register("priority")}>
					<option value="" disabled></option>
					{priorities.map((priority: Priority) => {
						return <option key = {priority.id} value = {priority.id}>{priority.name}</option>
					})}
				</select>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-ticket-status">Status</label>
				<select className = "tw-w-full" id = "filters-ticket-status" {...register("status")}>
					<option value="" disabled></option>
					{statuses.map((status: Status) => {
						return <option key = {status.id} value = {status.id}>{status.name}</option>
					})}
				</select>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-ticket-board">Board</label>
				{
					!isLoading ? (
						<Controller
							name={"board"}
							control={control}
			                render={({ field: { onChange, value, name, ref } }) => (
			                	<AsyncSelect 
				                	endpoint={BOARD_URL} 
				                	urlParams={{}} 
				                	defaultValue={watch("board") ? {value: boardInfo?.[0]?.id.toString() ?? "", label: boardInfo?.[0]?.name ?? ""} : {label: "", value: ""}}
				                	className={"tw-w-64"}
				                	onSelect={(selectedOption: {label: string, value: string} | null) => {
				                		onChange(selectedOption?.value ?? null) 	
				                	}}
				                />
			                )}
						/>
					) : (
						<LoadingSkeleton className= "tw-bg-gray-200" width = "tw-w-64" height="tw-h-10"/>	
					)
				}
			</div>
		</div>
	)
}