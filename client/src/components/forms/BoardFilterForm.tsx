import React, { useState, useEffect } from "react"
import { USER_PROFILE_URL, SPRINT_URL } from "../../helpers/urls"
import { TicketType, Priority, Status, Toast, OptionType, Sprint } from "../../types/common"
import { Controller, useForm, FormProvider } from "react-hook-form"
import { AsyncSelect, LoadOptionsType } from "../AsyncSelect"
import { Select } from "../page-elements/Select"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { LoadingButton } from "../page-elements/LoadingButton"
import { setBulkEditFilters, setFilters } from "../../slices/boardFilterSlice"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { useLazyGetUserProfilesQuery, useGetUserBoardFiltersQuery, useUpdateUserBoardFiltersMutation } from "../../services/private/userProfile"
import { useLazyGetSprintQuery } from "../../services/private/sprint"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { boardApi } from "../../services/private/board"
import { Button } from "../page-elements/Button"
import { format } from "date-fns"
import { addToast } from "../../slices/toastSlice"
import { displayUser } from "../../helpers/functions"
import { v4 as uuidv4 } from "uuid"
import { Label } from "../page-elements/Label"

export type FormValues = {
	priorityId: OptionType 
	statusId: OptionType
	ticketTypeId: OptionType
	assignee: OptionType
	sprint: OptionType
}

interface Props {
	boardId: number
	isBulkEdit?: boolean
}

export const BoardFilterForm = ({boardId, isBulkEdit}: Props) => {
	const dispatch = useAppDispatch()
	const { ticketTypes, ticketTypesForSelect } = useAppSelector((state) => state.ticketType)
	const { priorities, prioritiesForSelect } = useAppSelector((state) => state.priority)
	const { statuses, statusesForSelect } = useAppSelector((state) => state.status)
	const { filters: boardFilters, filterIdMap, bulkEditFilters } = useAppSelector((state) => state.boardFilter)
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const filters = isBulkEdit ? bulkEditFilters : boardFilters
	const defaultForm: FormValues = {
		ticketTypeId: {value: "", label: ""},
		priorityId: {value: "", label: ""},
		statusId: {value: "", label: ""},
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
				ticketTypeId: ticketTypeId ? {label: ticketTypes.find((ticketType) => ticketType.id === ticketTypeId)?.name ?? "", value: ticketTypeId.toString()} : {label: "", value: ""}, 
				priorityId: priorityId ? {label: priorities.find((priority) => priority.id === priorityId)?.name ?? "", value: priorityId.toString()} : {label: "", value: ""},
				statusId: statusId ? {label: statuses.find((status) => status.id === statusId)?.name ?? "", value: statusId?.toString()} : {label: "", value: ""},
			})
			if (assignee != null){
				if (assignee === 0){
					setValue("assignee", {label: "Unassigned", value: "0"})
				}
				else if (!isNaN(Number(assignee))){
					trigger({userIds: [assignee]})
				}
				else {
					setValue("assignee", {label: "", value: ""})
				}
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
				setValue("assignee", {value: user.id.toString(), label: displayUser(user)})
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
		const filtersApplied = !(values.ticketTypeId?.value === "" && values.priorityId?.value === "" && values.statusId?.value === "" && values.assignee?.value === "" && values.sprint?.value === "")
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	const onSubmit = (values: FormValues) => {
		const newFilterValues = {
            ...filters,
			ticketTypeId: values.ticketTypeId && values.ticketTypeId.value ? Number(values.ticketTypeId.value) : null,
			priorityId: values.priorityId && values.priorityId.value ? Number(values.priorityId.value) : null,
			statusId: values.statusId && values.statusId.value !== "" ? Number(values.statusId.value) : null,
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
			// { board_filter_id: filter id from the id map, value: the form value}
			const userBoardFilters = [
				...(watch("sprint") != null && watch("sprint").value !== "" && "sprintId" in filterIdMap ? [{ board_filter_id: filterIdMap["sprintId"], value: Number(watch("sprint").value)}] : []),
				...(watch("assignee") != null && watch("assignee").value !== "" && "assignee" in filterIdMap ? [{ board_filter_id: filterIdMap["assignee"], value: Number(watch("assignee").value)}] : []),
				...(watch("statusId") != null && watch("statusId").value !== "" && "statusId" in filterIdMap ? [{ board_filter_id: filterIdMap["statusId"], value: Number(watch("statusId").value)}] : []),
				...(watch("priorityId") != null && watch("priorityId").value !== "" && "priorityId" in filterIdMap ? [{ board_filter_id: filterIdMap["priorityId"], value: Number(watch("priorityId").value)}] : []),
				...(watch("ticketTypeId") != null && watch("ticketTypeId").value !== "" && "ticketTypeId" in filterIdMap ? [{ board_filter_id: filterIdMap["ticketTypeId"], value: Number(watch("ticketTypeId").value)}] : []),
			] 
			await updateUserBoardFilters({
				userBoardFilters,
				boardId
			}).unwrap()
			onSubmit({
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
				<div className = "tw-flex tw-flex-col tw-gap-y-4">
					<div className="tw-flex tw-flex-col tw-gap-y-2">
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "filters-ticket-type">Ticket Type</Label>
							<Controller name={"ticketTypeId"} control={control} render={({field: {onChange}}) => (
								<Select 
									id={"filters-ticket-type"}
									options={ticketTypesForSelect}
									defaultValue={watch("ticketTypeId") ?? {value: "", label: ""}}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}>
							</Controller>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "filters-ticket-priority">Priority</Label>
							<Controller name={"priorityId"} control={control} render={({field: {onChange}}) => (
								<Select 
									id={"filters-ticket-priority"}
									options={prioritiesForSelect}
									defaultValue={watch("priorityId") ?? {value: "", label: ""}}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}>
							</Controller>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "filters-ticket-status">Status</Label>
							<Controller name={"statusId"} control={control} render={({field: {onChange}}) => (
								<Select 
									id={"filters-ticket-status"}
									options={statusesForSelect}
									defaultValue={watch("statusId") ?? {value: "", label: ""}}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}>
							</Controller>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "filters-ticket-assignee">Assignee</Label>
							<Controller
								name={"assignee"}
								control={control}
								render={({ field: { onChange, value, name, ref } }) => (
								<AsyncSelect 
									id={"filters-ticket-assignee"}
									defaultValue={watch("assignee") ?? {value: "", label: ""}}
									endpoint={USER_PROFILE_URL} 
									urlParams={{forSelect: true, includeUnassigned: true}} 
									className={"tw-w-full"}
									clearable={true}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
								)}
							/>
						</div>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<Label htmlFor = "filters-ticket-sprint">Sprint</Label>
							<Controller
								name={"sprint"}
								control={control}
								render={({ field: { onChange, value, name, ref } }) => (
								<AsyncSelect 
									id={"filters-ticket-sprint"}
									defaultValue={watch("sprint") ?? {value: "", label: ""}}
									endpoint={SPRINT_URL} 
									urlParams={{boardId: boardId, searchBy: "name", forSelect: true}} 
									className={"tw-w-full"}
									clearable={true}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
								)}
							/>
						</div>
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
