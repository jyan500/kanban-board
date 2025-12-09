import React, { useState, useEffect } from "react"
import { useFormContext, useForm, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { Board, TicketType, Priority, Status } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { BOARD_URL, SPRINT_URL, USER_PROFILE_URL } from "../../helpers/urls"
import { displayUser } from "../../helpers/functions"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"
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

interface FormValues {
	statusId: number | null
	ticketTypeId: number | null
	priorityId: number | null
	sprint: OptionType
	board: OptionType
	assignedToUser: OptionType
}

export const Filters = () => {
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { priorities } = useAppSelector((state) => state.priority)
	const { statuses } = useAppSelector((state) => state.status)
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const { filters } = useAppSelector((state) => state.ticketFilter)
	const dispatch = useAppDispatch()
	const defaultForm: FormValues = {
		ticketTypeId: 0,
		priorityId: 0,
		statusId: 0,
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
				ticketTypeId, 
				priorityId,
				statusId,
			})
			if (boardId){
				triggerGetBoard({id: boardId, urlParams: {}})
			}
			if (sprintId){
				triggerGetSprint({id: sprintId, urlParams: {}})
			}
			if (assignedToUser){
				if (!isNaN(Number(assignedToUser))){
					triggerGetUser(Number(assignedToUser))
				}
				else if (assignedToUser === "unassigned"){
					setValue("assignedToUser", {label: "Unassigned", value: "0"})
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
			assignedToUser = values.assignedToUser?.value == "0" ? "unassigned" : Number(values.assignedToUser.value)
		}
		else {
			assignedToUser = null
		}
		const newFilterValues = {
            ...filters,
			ticketTypeId: values.ticketTypeId !== 0 ? values.ticketTypeId : null,
			priorityId: values.priorityId !== 0 ? values.priorityId : null,
			statusId: values.statusId !== 0 ? values.statusId : null,
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
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
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
									defaultValue={watch("board") ?? {value: "", label: ""}}
									className={"tw-w-64"}
									onSelect={(selectedOption: {label: string, value: string} | null) => {
										onChange(selectedOption) 	
									}}
								/>
							)}
						/>
					) : (
						<LoadingSkeleton className= "tw-bg-gray-200" width = "tw-w-64" height="tw-h-10"/>	
					)
				}
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-ticket-sprint">Sprint</label>
				{
					!isSprintLoading ? (
						<Controller
							name={"sprint"}
							control={control}
							render={({ field: { onChange, value, name, ref } }) => (
								<AsyncSelect 
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
						<LoadingSkeleton className= "tw-bg-gray-200" width = "tw-w-64" height="tw-h-10"/>	
					)
				}
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-assignee">Assignee</label>
				{
					!isUserLoading ? (
						<Controller
							name={"assignedToUser"}
							control={control}
							render={({ field: { onChange, value, name, ref } }) => (
								<AsyncSelect 
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
						<LoadingSkeleton className= "tw-bg-gray-200" width = "tw-w-64" height="tw-h-10"/>	
					)
				}
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
