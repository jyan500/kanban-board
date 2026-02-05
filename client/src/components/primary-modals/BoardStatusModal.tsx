import React, { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks" 
import type { Status } from "../../types/common" 
import { addToast } from "../../slices/toastSlice" 
import { useBulkEditBoardStatusesMutation, useGetBoardStatusesQuery } from "../../services/private/board" 
import { toggleShowModal } from "../../slices/modalSlice"
import { sortStatusByOrder } from "../../helpers/functions" 
import { skipToken } from '@reduxjs/toolkit/query/react'
import { v4 as uuidv4 } from "uuid"
import { Switch } from "../page-elements/Switch"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Label } from "../page-elements/Label"

export const BoardStatusModal = () => {
	const dispatch = useAppDispatch()
	const { boardInfo, statusesToDisplay, tickets: boardTicketIds } = useAppSelector((state) => state.board)
	const { statuses } = useAppSelector((state) => state.status)
	const { showModal } = useAppSelector((state) => state.modal) 
	const { data: boardStatuses, isLoading: isBoardStatusesLoading } = useGetBoardStatusesQuery(boardInfo ? {id: boardInfo.id, isActive: true} : skipToken)
	const [ formStatuses, setFormStatuses ] = useState<Array<Status>>([])
	const [ bulkEditBoardStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditBoardStatusesMutation() 

	useEffect(() => {
		if (!isBoardStatusesLoading && boardStatuses){
			setFormStatuses(boardStatuses)
		}
	}, [isBoardStatusesLoading, boardStatuses])

	const onSubmit = async () => {
		if (boardInfo){
			try {
				await bulkEditBoardStatuses({boardId: boardInfo.id, statusIds: formStatuses.map((status)=>status.id)}).unwrap()
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "success",
	    			animationType: "animation-in",
	    			message: "Statuses toggled successfully!",
	    		}))	
			}
			catch (e){
				dispatch(addToast({
	    			id: uuidv4(),
	    			type: "failure",
	    			animationType: "animation-in",
	    			message: "Failed to toggle statuses",
	    		}))	
			}
		}
		dispatch(toggleShowModal(false))
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
			{[...statuses].sort(sortStatusByOrder).map((status: Status) => {
				return (
					<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2" key = {status.id}>
						<Switch id ={`status-${status.id}`} checked={formStatuses.find((s)=>s.id === status.id) != null} onChange={(e) => onCheck(status.id)}/>
						<Label htmlFor = {`status-${status.id}`}>{status.name}</Label>
					</div>
				)
			})}
			<div>
				<LoadingButton isLoading={isLoading} className = "button" onClick={onSubmit} text={"Save Changes"}/>	
			</div>
		</div>
	)	
}

