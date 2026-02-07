import React, { useState, useEffect } from "react"
import { useFormContext, useForm, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { Board, TicketType, Priority, Status } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { BOARD_URL, SPRINT_URL, USER_PROFILE_URL } from "../../helpers/urls"
import { displayUser } from "../../helpers/functions"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"
import { Select } from "../page-elements/Select"
import { useLazyGetBoardQuery } from "../../services/private/board"
import { useLazyGetSprintQuery } from "../../services/private/sprint"
import { useLazyGetUserQuery } from "../../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { ticketApi } from "../../services/private/ticket"
import { OptionType } from "../../types/common"
import { setFilters } from "../../slices/ticketFilterSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Button } from "../page-elements/Button"
import { PLACEHOLDER_COLOR } from "../../helpers/constants"
import { Label } from "../page-elements/Label"

interface FormValues {
	statusId: OptionType
	ticketTypeId: OptionType
	priorityId: OptionType
	sprint: OptionType
	board: OptionType
	assignedToUser: OptionType
}

export const Filters = () => {
	const { ticketTypes, ticketTypesForSelect } = useAppSelector((state) => state.ticketType)
	const { priorities, prioritiesForSelect } = useAppSelector((state) => state.priority)
	const { statuses, statusesForSelect } = useAppSelector((state) => state.status)
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const { filters } = useAppSelector((state) => state.ticketFilter)
	const dispatch = useAppDispatch()
	const defaultForm: FormValues = {
		ticketTypeId: {value: "", label: ""},
		priorityId: {value: "", label: ""},
		statusId: {value: "", label: ""},
		board: {value: "", label: ""},
		sprint: {value: "", label: ""},
		assignedToUser: {value: "", label: ""},
	}
	const [ preloadedValues, setPreloadedValues ] = useState<FormValues>()
	const { reset, register, setValue, getValues, watch, control, handleSubmit } = useForm<FormValues>({defaultValues: preloadedValues})
	const [ triggerGetBoard, {data: boardInfo, isFetching, isLoading, isError }] = useLazyGetBoardQuery()
	const [ triggerGetSprint, {data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading }] = useLazyGetSprintQuery()
	const [ triggerGetUser, {data: userData, isFetching: isUserFetching, isLoading: isUserLoading}] = useLazyGetUserQuery()

	useEffect(() => {
		if (!showSecondaryModal){
			reset(defaultForm)
		}
	}, [showSecondaryModal])

	useEffect(() => {
		if (filters){
			const { ticketTypeId, priorityId, statusId, boardId, sprintId, assignedToUser } = filters
			reset({
				...defaultForm,
				ticketTypeId: ticketTypeId ? {label: ticketTypes.find((ticketType) => ticketType.id === ticketTypeId)?.name ?? "", value: ticketTypeId.toString()} : {label: "", value: ""}, 
				priorityId: priorityId ? {label: priorities.find((priority) => priority.id === priorityId)?.name ?? "", value: priorityId.toString()} : {label: "", value: ""},
				statusId: statusId ? {label: statuses.find((status) => status.id === statusId)?.name ?? "", value: statusId?.toString()} : {label: "", value: ""},
			})
			if (boardId){
				triggerGetBoard({id: boardId, urlParams: {}})
			}
			if (sprintId){
				triggerGetSprint({id: sprintId, urlParams: {}})
			}
			if (assignedToUser != null){
				if (assignedToUser === 0){
					setValue("assignedToUser", {label: "Unassigned", value: "0"})
				}
				else if (!isNaN(Number(assignedToUser))){
					triggerGetUser(Number(assignedToUser))
				}
				else {
					setValue("assignedToUser", {label: "", value: ""})
				}
			}
		}
	}, [])

	useEffect(() => {
		if (!isFetching && boardInfo?.length){
			setValue("board", {value: boardInfo[0].id.toString(), label: boardInfo[0].name})
		}
	}, [isFetching, boardInfo])

	useEffect(() => {
		if (!isSprintFetching && sprintData){
			setValue("sprint", {value: sprintData.id.toString(), label: sprintData.name})
		}
	}, [isSprintFetching, sprintData])

	useEffect(() => {
		if (!isUserFetching && userData){
			setValue("assignedToUser", {value: userData.id.toString(), label: displayUser(userData)})
		}
	}, [isUserFetching, userData])

	const onSubmit = (values: FormValues) => {
		let assignedToUser: number | string | null;
		if (values.assignedToUser?.value !== ""){
			assignedToUser = values.assignedToUser?.value == "0" ? 0 : Number(values.assignedToUser.value)
		}
		else {
			assignedToUser = null
		}
		const newFilterValues = {
            ...filters,
			ticketTypeId: values.ticketTypeId && values.ticketTypeId.value ? Number(values.ticketTypeId.value) : null,
			priorityId: values.priorityId && values.priorityId.value ? Number(values.priorityId.value) : null,
			statusId: values.statusId && values.statusId.value !== "" ? Number(values.statusId.value) : null,
			boardId: values.board && values.board.value !== "" ? Number(values.board.value) : null,
			sprintId: values.sprint && values.sprint.value !== "" ? Number(values.sprint.value) : null,
			assignedToUser: assignedToUser 
		}
		dispatch(setFilters(newFilterValues))
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-4">
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
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
					<Label htmlFor = "filters-ticket-board">Board</Label>
					{
						!isLoading ? (
							<Controller
								name={"board"}
								control={control}
								render={({ field: { onChange, value, name, ref } }) => (
									<AsyncSelect 
										id={"filters-ticket-board"}
										endpoint={BOARD_URL} 
										urlParams={{}} 
										defaultValue={watch("board") ?? {value: "", label: ""}}
										className={"tw-w-64"}
										onSelect={(selectedOption: {label: string, value: string} | null) => {
											onChange(selectedOption) 	
										}}
									/>
								)}
							/>
						) : (
							<LoadingSkeleton className= {PLACEHOLDER_COLOR} width = "tw-w-64" height="tw-h-10"/>	
						)
					}
				</div>
				<div className = "tw-flex tw-flex-col tw-gap-y-2">
					<Label htmlFor = "filters-ticket-sprint">Sprint</Label>
					{
						!isSprintLoading ? (
							<Controller
								name={"sprint"}
								control={control}
								render={({ field: { onChange, value, name, ref } }) => (
									<AsyncSelect 
										id={"filters-ticket-sprint"}
										endpoint={SPRINT_URL} 
										urlParams={{"searchBy": "name"}} 
										defaultValue={watch("sprint") ?? {value: "", label: ""}}
										className={"tw-w-64"}
										onSelect={(selectedOption: {label: string, value: string} | null) => {
											onChange(selectedOption) 	
										}}
									/>
								)}
							/>
						) : (
							<LoadingSkeleton className= {PLACEHOLDER_COLOR} width = "tw-w-64" height="tw-h-10"/>	
						)
					}
				</div>
				<div className = "tw-flex tw-flex-col tw-gap-y-2">
					<Label htmlFor = "filters-assignee">Assignee</Label>
					{
						!isUserLoading ? (
							<Controller
								name={"assignedToUser"}
								control={control}
								render={({ field: { onChange, value, name, ref } }) => (
									<AsyncSelect 
										id={"filters-assignee"}
										endpoint={USER_PROFILE_URL} 
										urlParams={{forSelect: true, includeUnassigned: true}} 
										defaultValue={watch("assignedToUser") ?? {value: "", label: ""}}
										className={"tw-w-64"}
										onSelect={(selectedOption: {label: string, value: string} | null) => {
											onChange(selectedOption) 	
										}}
									/>
								)}
							/>
						) : (
							<LoadingSkeleton className={PLACEHOLDER_COLOR} width = "tw-w-64" height="tw-h-10"/>	
						)
					}
				</div>
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton type={"submit"} text={"Submit"}/>	
				<Button theme="secondary" onClick={(e) => {
					e.preventDefault()
					reset(defaultForm)
					const resetFilters = {
						...filters,
						ticketTypeId: null,
						priorityId: null,
						statusId: null,
						boardId: null,
						sprintId: null,
						assignedToUser: null,
					}
					dispatch(setFilters(resetFilters))
					dispatch(ticketApi.util.invalidateTags(["Tickets"]))
				}}>Clear Filters</Button>	
			</div>
		</form>
	)
}
