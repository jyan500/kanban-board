import React, { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import type { Status } from "../types/common" 
import "../styles/status-form.css"
import { updateStatuses, updateStatusesToDisplay } from "../slices/boardSlice" 
import { addToast } from "../slices/toastSlice" 
import { useBulkEditBoardStatusesMutation } from "../services/private/board" 
import { toggleShowModal } from "../slices/modalSlice"
import { doTicketsContainStatus, sortStatusByOrder } from "../helpers/functions" 
import { IoMdClose } from "react-icons/io";
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"
import { MdOutlineArrowForwardIos as ArrowForward } from "react-icons/md"
import { v4 as uuidv4 } from "uuid"

// change visible statuses
// add custom statuses
export const StatusForm = () => {
	const dispatch = useAppDispatch()
	const { boardInfo, statusesToDisplay, tickets: boardTicketIds } = useAppSelector((state) => state.board)
	const { statuses } = useAppSelector((state) => state.status)
	const { showModal } = useAppSelector((state) => state.modal) 
	const { tickets } = useAppSelector((state) => state.ticket)
	const [formStatuses, setFormStatuses] = useState<Array<Status>>(statusesToDisplay)
	const [ bulkEditBoardStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditBoardStatusesMutation() 
	// const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null)

	// useEffect(() => {
	// 	setSelectedStatusId(null)	
	// }, [showModal])

	// const addStatus = () => {
	// 	const prevMaxOrder = Math.max(...form.statuses.map((status)=>status.order))
	// 	const newStatus: Status =  {
	// 		id: uuidv4(),
	// 		order: prevMaxOrder + 1,
	// 		name: "New Status"
	// 	}
	// 	setForm({
	// 		...form,
	// 		statuses: [...form.statuses, newStatus]
	// 	})
	// 	setSelectedStatusId(newStatus.id)
	// }

	// const removeStatus = () => {
	// 	const index = form.statuses.findIndex((status) => status.id === selectedStatusId)
	// 	// if deleting an index in the middle of the list, make sure the order of each
	// 	// element after is decremented by one
	// 	let updated = form.statuses.map((status, i) => {
	// 		if (i > index){
	// 			return {...status, order: status.order - 1}
	// 		}
	// 		else {
	// 			return status
	// 		}
	// 	})
	// 	// remove the status from the status list
	// 	updated.splice(index, 1)	
	// 	setForm({
	// 		...form,
	// 		statuses: updated,
	// 		statusesToDisplay: form.statusesToDisplay.filter((status) => status.id !== selectedStatusId)
	// 	})	
	// 	// remove the status from status to display list
	// 	setSelectedStatusId(null)
	// }

	// const onChangeName = (value: string) => {
	// 	const index = form.statuses.findIndex((status) => status.id === selectedStatusId)
	// 	const status = form.statuses[index]
	// 	if (status){
	// 		let temp = form.statuses.map((status) => ({...status}))
	// 		temp.splice(index, 1, {...status, name: value})
	// 		setForm({
	// 			...form,
	// 			statuses: temp,
	// 		})
	// 	}
	// }

	const onSubmit = async () => {
		// dispatch(updateStatuses(form.statuses))
		// dispatch(updateStatusesToDisplay(form.statusesToDisplay))
		//
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
		// if (selectedStatusId){
		// 	const statusIndex = form.statuses.findIndex((status) => status.id === selectedStatusId)
		// 	const status = form.statuses[statusIndex]
		// 	if (status){
		// 		const isVisible = form.statusesToDisplay.filter((status) => selectedStatusId === status.id).length > 0
		// 		let temp = [...form.statusesToDisplay]
		// 		if (isVisible){
		// 			let i = temp.findIndex((status) => status.id === selectedStatusId)
		// 			temp.splice(i, 1)
		// 		}
		// 		else {
		// 			temp.push(status)
		// 		}
		// 		setForm({...form, statusesToDisplay: temp})
		// 	}
		// }
	}

	// const setOrder = (statusId: number, isBackwards: boolean) => {
	// 	const selectedStatusIndex = form.statuses.findIndex((status: Status) => status.id === statusId)	
	// 	const selectedStatus = form.statuses[selectedStatusIndex]
	// 	// you cannot move order of 1 any further backwards
	// 	if (selectedStatus && 
	// 		(
	// 			(isBackwards && selectedStatus.order !== 1) || 
	// 			(!isBackwards && selectedStatus.order !== form.statuses.length)
	// 		)
	// 	){
	// 		// find the element that was previously one behind and swap places with this element
	// 		const previousIndex = form.statuses.findIndex((status: Status) => (isBackwards ? (selectedStatus.order - 1 === status.order) : selectedStatus.order + 1 === status.order))
	// 		const previous = form.statuses[previousIndex]
	// 		if (previous){
	// 			let temp = form.statuses.map(status => ({...status})) 
	// 			let tempPrevOrder = previous.order
	// 			let tempSelectedOrder = selectedStatus.order
	// 			temp.splice(selectedStatusIndex, 1, {...selectedStatus, order: tempPrevOrder})
	// 			temp.splice(previousIndex, 1, {...previous, order: tempSelectedOrder})
	// 			setForm({...form, statuses: temp})
	// 		}
	// 	}	
	// }

	return (
		<div className = "container">
			<div>
				{[...statuses].sort(sortStatusByOrder).map((status: Status) => {
					return (
						<div key = {status.id} className="form-row">
							<div className = "form-cell">
								<input checked = {formStatuses.find((s)=>s.id === status.id) != null} onChange={(e) => onCheck(status.id)} type = "checkbox"/>
							</div>
							<div className = "form-cell">
								<label>{status.name}</label>
							</div>
						</div>
					)
				})}
				<div className = "form-row">
					<div className = "btn-group">
						<button onClick={onSubmit}>Save Changes</button>	
					</div>
					{/*<button onClick={addStatus}>Add Status</button>*/}
					{
						// you can only remove statuses that don't have any tickets associated with that status
						// selectedStatusId != null && !doTicketsContainStatus(selectedStatusId, boardTicketIds) ? (
						// 	<button onClick = {removeStatus} className = "--alert">Remove Status</button>) : null
					}
				</div>
			</div>
		</div>
	)	
}