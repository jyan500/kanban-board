import React, { useState, useEffect } from "react"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { TicketType, Priority, Status, OptionType } from "../../types/common"
import { Controller, useForm, FormProvider } from "react-hook-form"
import { AsyncSelect, LoadOptionsType } from "../AsyncSelect"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { LoadingButton } from "../page-elements/LoadingButton"
import { setFilters, setFilterButtonState } from "../../slices/boardScheduleSlice"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useLazyGetUserProfilesQuery } from "../../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { boardApi } from "../../services/private/board"

export type FormValues = {
	priorityId: number | null
	statusId: number | null
	ticketTypeId: number | null
	assignee: OptionType
	startDate: Date | null
	endDate: Date | null
}

interface Props {
	boardId: number	
}

export const BoardScheduleFilterModal = ({boardId}: Props) => {
	const dispatch = useAppDispatch()
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { filters } = useAppSelector((state) => state.boardSchedule)
	const defaultForm: FormValues = {
		ticketTypeId: 0,
		priorityId: 0,
		statusId: 0,
		assignee: {value: "", label: ""},
		startDate: null,
		endDate: null,
	}
	const [ trigger, {data, isLoading, isFetching}] = useLazyGetUserProfilesQuery()
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , control, setValue, getValues, watch, formState: {errors} } = methods

	useEffect(() => {
		if (filters){
			const { ticketTypeId, priorityId, statusId, assignee, startDate, endDate } = filters
			reset({
				...defaultForm,
				ticketTypeId, 
				priorityId,
				statusId,
				startDate,
				endDate
			})
			if (assignee){
				trigger({userIds: [assignee]})
			}
		}
	}, [])

	useEffect(() => {
		if (!isFetching && data?.data?.length){
			const user = data?.data?.[0]
			if (user){
				setValue("assignee", {value: user.id.toString(), label: user.firstName + " " + user.lastName})
			}
		}
	}, [isFetching, data])

	const onSubmit = async (values: FormValues) => {
		dispatch(setFilters({
			ticketTypeId: values.ticketTypeId !== 0 ? values.ticketTypeId : null,
			priorityId: values.priorityId !== 0 ? values.priorityId : null,
			statusId: values.statusId !== 0 ? values.statusId : null,
			startDate: values.startDate,
			endDate: values.endDate,
			assignee: values.assignee.value !== "" ? Number(values.assignee.value) : null
		}))
		// if there are any filters applied, set filter button state to 1 to show that filters have been applied
		const { assignee, ...assigneeExcluded} = values
		const filtersApplied = !(values.ticketTypeId === 0 && values.priorityId === 0 && values.statusId === 0 && values.startDate == null && values.endDate == null && values.assignee.value === "")
		dispatch(setFilterButtonState(filtersApplied ? 1 : 0))
		dispatch(toggleShowModal(false))
		dispatch(setModalProps({}))
		dispatch(setModalType(undefined))
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-w-[500px]">
			<p className = "tw-font-semibold tw-text-xl">Filters</p>	
			<form onSubmit={handleSubmit(onSubmit)}>
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
					<div className = "tw-flex tw-flex-col">
						<label className = "label" htmlFor = "filters-ticket-assignee">Assignee</label>
						<Controller
							name={"assignee"}
							control={control}
			                render={({ field: { onChange, value, name, ref } }) => (
		                	<AsyncSelect 
		                		defaultValue={watch("assignee") ?? null}
			                	endpoint={USER_PROFILE_URL} 
			                	urlParams={{forSelect: true}} 
			                	className={"tw-w-full"}
			                	onSelect={(selectedOption: {label: string, value: string} | null) => {
			                		onChange(selectedOption) 	
			                	}}
			                />
			                )}
						/>
					</div>
					<div className = "tw-flex tw-flex-col">
						<label className = "label" htmlFor = "filters-noti-date-from">Start Date</label>
						<input {...register("startDate")} id = "filters-noti-date-from" aria-label="Date" type="date"/>
					</div>
					<div className = "tw-flex tw-flex-col">
						<label className = "label" htmlFor = "filters-noti-date-to">End Date</label>
						<input {...register("endDate")} id = "filters-noti-date-to" aria-label="Date" type="date"/>
					</div>
					<div className = "tw-flex tw-flex-row tw-gap-x-2">
						<LoadingButton type={"submit"} text={"Submit"}/>	
						<button onClick={(e) => {
							e.preventDefault()
							reset(defaultForm)
							dispatch(setFilters({
								ticketTypeId: null,
								priorityId: null,
								statusId: null,
								startDate: null,
								endDate: null,
								assignee: null
							}))
							dispatch(boardApi.util.invalidateTags(["BoardTickets"]))
							dispatch(setFilterButtonState(0))
						}} className = "button --secondary">Clear Filters</button>	
					</div>
				</div>
			</form>
		</div>
	)	
}