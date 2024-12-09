import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { selectCurrentTicketId } from "../slices/boardSlice"
import { toggleShowModal } from "../slices/modalSlice" 
import { 
	useAddBoardMutation, 
	useGetBoardQuery,
	useUpdateBoardMutation, 
	useBulkEditBoardStatusesMutation, 
	useGetBoardStatusesQuery 
} from "../services/private/board" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../slices/toastSlice" 
import { LoadingSpinner } from "./LoadingSpinner"
import { Board, Status } from "../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'

type FormValues = {
	id?: number
	name: string
}

export const BoardForm = () => {
	const dispatch = useAppDispatch()
	const {
		showModal
	} = useAppSelector((state) => state.modal)
	const { statuses } = useAppSelector((state) => state.status)
	const { currentBoardId } = useAppSelector((state) => state.boardInfo)
	const defaultForm: FormValues = {
		id: undefined,
		name: "",
	}
	const [ addBoard ] = useAddBoardMutation() 
	const [ updateBoard ] = useUpdateBoardMutation()
	const { data: boardInfo, isLoading: isGetBoardDataLoading  } = useGetBoardQuery(currentBoardId ? {id: currentBoardId, urlParams: {}} : skipToken)
	const { data: statusData, isLoading: isStatusDataLoading } = useGetBoardStatusesQuery(currentBoardId ? {id: currentBoardId, isActive: true } : skipToken)
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const [formStatuses, setFormStatuses] = useState<Array<Status>>([])
	const [ bulkEditBoardStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditBoardStatusesMutation() 
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})
	const registerOptions = {
	    name: { required: "Name is required" },
    }
	useEffect(() => {
		// initialize with current values if the board exists
		if (currentBoardId && boardInfo?.length){
			reset({id: currentBoardId, name: boardInfo?.[0].name})
		}
		else {
			reset(defaultForm)
		}
	}, [showModal, boardInfo, currentBoardId])

	useEffect(() => {
		if (!isStatusDataLoading && statusData){
			setFormStatuses(statusData)
		}
	}, [isStatusDataLoading, statusData])

    const onSubmit = async (values: FormValues) => {
    	try {
    		if (values.id != null && currentBoardId){
    			await updateBoard(values).unwrap()
				await bulkEditBoardStatuses({boardId: currentBoardId, statusIds: formStatuses.map((status) => status.id)}).unwrap()
    		}	
    		else {
    			const res = await addBoard(values).unwrap()
				await bulkEditBoardStatuses({boardId: res.id, statusIds: formStatuses.map((status) => status.id)}).unwrap()
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
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<form>
				<div className = "tw-flex tw-flex-col">
					<label className = "label" htmlFor = "board-name">Name</label>
					<input id = "board-name" type = "text"
					{...register("name", registerOptions.name)}
					/>
			        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
				</div>
				<div className = "tw-flex tw-flex-col">
				{ !isStatusDataLoading ? (statuses.filter((status) => status.isActive).map((status) => (
					<div key = {status.id} className="tw-flex tw-flex-row tw-gap-x-2 tw-py-2">
						<input id = {`board-status-${status.id}`} checked = {formStatuses.find((s)=>s.id === status.id) != null} onChange={(e) => onCheck(status.id)} type = "checkbox"/>
						<label htmlFor = {`board-status-${status.id}`}>{status.name}</label>
					</div>
				))) : <LoadingSpinner/>}
				</div>
				<div className = "tw-flex tw-flex-col">
					<button onClick={handleSubmit(onSubmit)} className = "button">Submit</button>
				</div>
			</form>
		</div>
	)	
}
