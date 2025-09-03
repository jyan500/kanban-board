import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { 
	useAddBoardMutation, 
	useGetBoardQuery,
	useUpdateBoardMutation, 
	useBulkEditBoardStatusesMutation, 
	useGetBoardStatusesQuery,
	useGetBoardProjectsQuery,
	useUpdateBoardProjectsMutation,
} from "../services/private/board" 
import { useGetProjectQuery } from "../services/private/project"
import { useForm, Controller } from "react-hook-form"
import { MultiValue } from "react-select"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { Board, OptionType, Project, Status } from "../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { MIN_BOARD_TICKET_LIMIT, MAX_BOARD_TICKET_LIMIT } from "../helpers/constants"
import { Switch } from "./page-elements/Switch"
import { LoadingButton } from "./page-elements/LoadingButton"
import { AsyncSelect } from "./AsyncSelect"
import { AsyncMultiSelect } from "./AsyncMultiSelect"
import { BOARD_URL, PROJECT_URL } from "../helpers/urls"

interface Props {
	projectId?: number
	boardId?: number
}

type FormValues = {
	id?: number
	name: string
	ticketLimit: number
	projectIdOptions: Array<OptionType>
}

export const BoardForm = ({boardId, projectId}: Props) => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const { statuses } = useAppSelector((state) => state.status)
	const defaultForm: FormValues = {
		id: undefined,
		ticketLimit: MAX_BOARD_TICKET_LIMIT,
		name: "",
		projectIdOptions: []
	}
	const [currentBoardId, setCurrentBoard] = useState(boardId ?? null)
	const [ addBoard ] = useAddBoardMutation() 
	const [ updateBoard ] = useUpdateBoardMutation()
	const [ updateBoardProjects ] = useUpdateBoardProjectsMutation()
	const { data: boardInfo, isLoading: isGetBoardDataLoading  } = useGetBoardQuery(currentBoardId ? {id: currentBoardId, urlParams: {}} : skipToken)
	const { data: statusData, isLoading: isStatusDataLoading } = useGetBoardStatusesQuery(currentBoardId ? {id: currentBoardId, isActive: true } : skipToken)
	const { data: boardProjects, isLoading: isBoardProjectsLoading } = useGetBoardProjectsQuery(currentBoardId ? {boardId: currentBoardId, urlParams: {}} : skipToken)
	const { data: project, isLoading: isGetProjectDataLoading } = useGetProjectQuery(projectId ? {id: projectId, urlParams: {}}: skipToken)
	const [ preloadedValues, setPreloadedValues ] = useState<FormValues>(defaultForm)
	const [ formStatuses, setFormStatuses ] = useState<Array<Status>>([])
	const [ bulkEditBoardStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditBoardStatusesMutation() 
	const { register , handleSubmit, reset, control, setValue, getValues, watch, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const [ submitLoading ,setSubmitLoading ] = useState(false)
	const registerOptions = {
	    name: { required: "Name is required" },
	    ticketLimit: { 
	    	required: "Ticket Limit is required", 
		    valueAsNumber: true,
	        min: { value: MIN_BOARD_TICKET_LIMIT, message: `Must be at least ${MIN_BOARD_TICKET_LIMIT}` },
	        max: { value: MAX_BOARD_TICKET_LIMIT, message: `Must be at most ${MAX_BOARD_TICKET_LIMIT}` }
	    },
		projectIdOptions: {}
    }
	useEffect(() => {
		// initialize with current values if the board exists
		if (currentBoardId && boardInfo?.length){
			let options: Array<OptionType> = []
			if (boardProjects?.data?.length){
				options = boardProjects.data.map((project: Project) => {
					const option: OptionType = {
						label: project.name,
						value: project.id.toString()
					}
					return option
				})
			}
			reset({id: currentBoardId, ticketLimit: boardInfo?.[0].ticketLimit, name: boardInfo?.[0].name, projectIdOptions: options})
		}
		else {
			let options: Array<OptionType> = []
			if (project){
				options = [{label: project.name, value: project.id.toString()} as OptionType]
			}
			reset({...defaultForm, projectIdOptions: options})
		}
	}, [showModal, boardInfo, boardProjects, project, projectId, boardId, currentBoardId])

	useEffect(() => {
		if (!isStatusDataLoading && statusData){
			setFormStatuses(statusData)
		}
	}, [isStatusDataLoading, statusData])

    const onSubmit = async (values: FormValues) => {
		setSubmitLoading(true)
    	try {
    		if (values.id != null && currentBoardId){
    			await updateBoard(values).unwrap()
				await bulkEditBoardStatuses({boardId: currentBoardId, statusIds: formStatuses.map((status) => status.id)}).unwrap()
    		}	
    		else {
    			const res = await addBoard(values).unwrap()
				await bulkEditBoardStatuses({boardId: res.id, statusIds: formStatuses.map((status) => status.id)}).unwrap()
    		}
			if (values.projectIdOptions && currentBoardId){
				await updateBoardProjects({boardId: currentBoardId, ids: values.projectIdOptions.map((optionType) => Number(optionType.value))}).unwrap()
			}
    		dispatch(toggleShowModal(false))
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Board ${values.id != null ? "updated" : "added"} successfully!`,
    		}))
    	}
    	catch {
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to ${values.id != null ? "update" : "add"} board.`,
    		}))
    	}
    	finally {
    		setSubmitLoading(false)
    	}
    }

    const onCheck = (id: number) => {
		const formStatus = formStatuses.find((status) => status.id === id)
		// if index could not be found in the display statuses, add to the form statuses, otherwise remove
		if (!formStatus){
			const status = statuses.find((status) => status.id === id)
			if (status){
				setFormStatuses([...formStatuses, status])
			}
		}
		else {
			setFormStatuses(formStatuses.filter((s)=>formStatus.id !== s.id))	
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
			{
				!boardId ? 
				<div className = "tw-flex tw-flex-col tw-gap-y-2">
					<label className = "label" htmlFor = "existing-board">Board</label>
					<span className = "tw-text-xs">Prefill information with existing board</span>
					<AsyncSelect 
						endpoint={BOARD_URL} 
						clearable={true}
						urlParams={{forSelect: true}} 
						onSelect={async (selectedOption: OptionType | null) => {
							if (!selectedOption){
								reset(defaultForm)
								setFormStatuses([])
							}
							setCurrentBoard(selectedOption ? Number(selectedOption.value) : null)
						}}
					/>
				</div> : null
			}
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "board-name">Name</label>
				<input id = "board-name" type = "text"
				{...register("name", registerOptions.name)}
				/>
		        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<div>
					<label className = "label" htmlFor = "board-ticket-limit">Ticket Limit</label>
					<span className = "tw-text-xs">Limits the amount of tickets are shown on the board</span>
				</div>
				<input id = "board-ticket-limit" type = "number"
				{...register("ticketLimit", registerOptions.ticketLimit)}
				/>
		        {errors?.ticketLimit && <small className = "--text-alert">{errors.ticketLimit.message}</small>}
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label">Projects</label>
				<Controller
					name={"projectIdOptions"}
					control={control}
					rules={registerOptions.projectIdOptions}
					render={({ field: { onChange, value, name, ref } }) => (
						<AsyncMultiSelect 
							endpoint={PROJECT_URL} 
							clearable={true}
							defaultValue={watch("projectIdOptions") ?? null}
							urlParams={{forSelect: true}} 
							onSelect={async (selectedOption: MultiValue<OptionType> | null) => {
								onChange(selectedOption)
							}}
						/>
					)}
				/>
			</div>
			<div className = "tw-flex tw-flex-col">
			{ !isStatusDataLoading ? (statuses.filter((status) => status.isActive).map((status) => (
				<div key = {status.id} className="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-py-2">
					<Switch id = {`board-status-${status.id}`} checked={formStatuses.find((s)=>s.id === status.id) != null} onChange={(e) => onCheck(status.id)}/>
					<label htmlFor = {`board-status-${status.id}`}>{status.name}</label>
				</div>
			))) : <LoadingSpinner/>}
			</div>
			<div className = "tw-flex tw-flex-col">
				<LoadingButton isLoading={submitLoading} type="submit" text="Submit" className = "button"/>
			</div>
		</form>
	)	
}
