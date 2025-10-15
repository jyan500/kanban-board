import React, { useState, useEffect } from "react"
import { USER_PROFILE_URL, SPRINT_URL } from "../../helpers/urls"
import { TicketType, Priority, Status, Toast, OptionType, Sprint } from "../../types/common"
import { Controller, useForm, FormProvider } from "react-hook-form"
import { AsyncSelect, LoadOptionsType } from "../AsyncSelect"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { LoadingButton } from "../page-elements/LoadingButton"
import { setBulkEditFilters, setBulkEditFilterButtonState, setFilters, setFilterButtonState } from "../../slices/boardFilterSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { useLazyGetUserProfilesQuery, useGetUserBoardFiltersQuery, useUpdateUserBoardFiltersMutation } from "../../services/private/userProfile"
import { useLazyGetSprintQuery } from "../../services/private/sprint"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { boardApi } from "../../services/private/board"
import { Button } from "../page-elements/Button"
import { format } from "date-fns"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"

export type FormValues = {
	priorityId: number | null
	statusId: number | null
	ticketTypeId: number | null
	assignee: OptionType
	sprint: OptionType
}

interface Props {
	boardId: number
	isBulkEdit?: boolean
}

export const BoardFilterForm = ({boardId, isBulkEdit}: Props) => {
	const dispatch = useAppDispatch()
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { filters: boardFilters, filterIdMap, bulkEditFilters } = useAppSelector((state) => state.boardFilter)
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const filters = isBulkEdit ? bulkEditFilters : boardFilters
	const defaultForm: FormValues = {
		ticketTypeId: 0,
		priorityId: 0,
		statusId: 0,
		assignee: {value: "", label: ""},
		sprint: {value: "", label: ""},
	}
	const [ trigger, {data, isLoading, isFetching}] = useLazyGetUserProfilesQuery()
	const [ triggerGetSprint, {data: sprintData, isLoading: isSprintLoading, isFetching: isSprintFetching}] = useLazyGetSprintQuery()
	const [ updateUserBoardFilters, {isLoading: isUpdateUserBoardFiltersLoading}] = useUpdateUserBoardFiltersMutation()
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const { register , handleSubmit, reset , control, setValue, getValues, watch, formState: {errors} } = methods

	useEffect(() => {
		if (!showSecondaryModal){
			reset(defaultForm)
		}
	}, [showSecondaryModal])

	useEffect(() => {
		if (filters){
			const { ticketTypeId, priorityId, statusId, assignee, sprintId } = filters
			reset({
				...defaultForm,
				ticketTypeId, 
				priorityId,
				statusId,
			})
			if (assignee){
				trigger({userIds: [assignee]})
			}
			if (sprintId){
				triggerGetSprint({id: sprintId, urlParams: {}})
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

	useEffect(() => {
		if (!isSprintFetching && sprintData){
			setValue("sprint", {value: sprintData.id.toString(), label: sprintData.name})
		}
	}, [isSprintFetching, sprintData])

	const postSubmit = (values: FormValues) => {
		// if there are any filters applied, set filter button state to 1 to show that filters have been applied
		const { assignee, sprint, ...otherValues} = values
		const filtersApplied = !(values.ticketTypeId === 0 && values.priorityId === 0 && values.statusId === 0 && values.assignee?.value === "" && values.sprint?.value === "")
		isBulkEdit ? dispatch(setBulkEditFilterButtonState(filtersApplied)) : dispatch(setFilterButtonState(filtersApplied))
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	const onSubmit = (values: FormValues) => {
		const newFilterValues = {
            ...filters,
			ticketTypeId: values.ticketTypeId !== 0 ? values.ticketTypeId : null,
			priorityId: values.priorityId !== 0 ? values.priorityId : null,
			statusId: values.statusId !== 0 ? values.statusId : null,
			assignee: values.assignee && values.assignee.value !== "" ? Number(values.assignee.value) : null,
			sprintId: values.sprint && values.sprint.value !== "" ? Number(values.sprint.value) : null
		}
		isBulkEdit ? dispatch(setBulkEditFilters(newFilterValues)) : dispatch(setFilters(newFilterValues))
		// if there are any filters applied, set filter button state to 1 to show that filters have been applied
		postSubmit(values)
	}

	const resetFilters = () => {
		reset(defaultForm)
		const resetFilters = {
			...filters,
			ticketTypeId: null,
			priorityId: null,
			statusId: null,
			assignee: null,
			sprintId: null
		}
		isBulkEdit ? dispatch(setBulkEditFilters(resetFilters)) : dispatch(setFilters(resetFilters))
		dispatch(boardApi.util.invalidateTags(["BoardTickets"]))
		isBulkEdit ? dispatch(setBulkEditFilterButtonState(false)) : dispatch(setFilterButtonState(false))
	}

	const setAsDefault = async () => {
		const defaultToast: Toast = {
			id: uuidv4(),
			message: "Default filters saved successfully!",
			animationType: "animation-in",
			type: "success"
		}
		try {
			// get the board filter ids for each filter type that has a value and map to an array of objects like so
			// { board_filter_id: filter id from the id map, value: the form vaule}
			const userBoardFilters = [
				...(watch("sprint").value !== "" && "sprintId" in filterIdMap ? [{ board_filter_id: filterIdMap["sprintId"], value: Number(watch("sprint").value)}] : []),
				...(watch("assignee").value !== "" && "assignee" in filterIdMap ? [{ board_filter_id: filterIdMap["assignee"], value: Number(watch("assignee").value)}] : []),
				...(watch("statusId") != 0 && "statusId" in filterIdMap ? [{ board_filter_id: filterIdMap["statusId"], value: Number(watch("statusId"))}] : []),
				...(watch("priorityId") != 0 && "priorityId" in filterIdMap ? [{ board_filter_id: filterIdMap["priorityId"], value: Number(watch("priorityId"))}] : []),
				...(watch("ticketTypeId") != 0 && "ticketTypeId" in filterIdMap ? [{ board_filter_id: filterIdMap["ticketTypeId"], value: Number(watch("ticketTypeId"))}] : []),
			] 
			await updateUserBoardFilters(userBoardFilters).unwrap()
			postSubmit({
				assignee: watch("assignee"),
				sprint: watch("sprint"),
				ticketTypeId: watch("ticketTypeId"),
				statusId: watch("statusId"),
				priorityId: watch("priorityId"),
			} as FormValues)
			dispatch(addToast(defaultToast))
		}
		catch {
			dispatch(addToast({
				...defaultToast,
				type: "failure",
				message: "There was an issue while saving default filters"
			}))
		}
	}

	return (
		<div className = "tw-p-2 tw-flex tw-flex-col tw-gap-y-2 tw-w-full lg:tw-w-[500px]">
			<form onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				handleSubmit(onSubmit)()
			}}>
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
		                		defaultValue={watch("assignee") ?? {value: "", label: ""}}
			                	endpoint={USER_PROFILE_URL} 
			                	urlParams={{forSelect: true}} 
			                	className={"tw-w-full"}
			                	clearable={false}
			                	onSelect={(selectedOption: {label: string, value: string} | null) => {
			                		onChange(selectedOption) 	
			                	}}
			                />
			                )}
						/>
					</div>
					<div className = "tw-flex tw-flex-col">
						<label className = "label" htmlFor = "filters-ticket-sprint">Sprint</label>
						<Controller
							name={"sprint"}
							control={control}
			                render={({ field: { onChange, value, name, ref } }) => (
		                	<AsyncSelect 
		                		defaultValue={watch("sprint") ?? {value: "", label: ""}}
			                	endpoint={SPRINT_URL} 
			                	urlParams={{boardId: boardId, searchBy: "name", forSelect: true}} 
			                	className={"tw-w-full"}
			                	clearable={false}
			                	onSelect={(selectedOption: {label: string, value: string} | null) => {
			                		onChange(selectedOption) 	
			                	}}
			                />
			                )}
						/>
					</div>
					<div className = "tw-flex tw-flex-row tw-gap-x-2">
						<Button theme={"primary"} type={"submit"}>Submit</Button>	
						{
							!isBulkEdit ? 
							<LoadingButton isLoading={isUpdateUserBoardFiltersLoading} theme={"secondary"} onClick={async (e) => {
								e.preventDefault()
								await setAsDefault()
							}}>Set as Default</LoadingButton>	
							: null
						}
						<Button onClick={(e) => {
							e.preventDefault()
							resetFilters()	
						}} theme="secondary">Clear Filters</Button>	
					</div>
				</div>
			</form>
		</div>
	)	
}
