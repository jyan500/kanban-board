import React, { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import type { Status } from "../types/common" 
import "../styles/status-form.css"
import { updateStatuses, updateStatusesToDisplay, toggleShowModal } from "../slices/boardSlice" 
import { doTicketsContainStatus, sortStatusByOrder } from "../helpers/functions" 
import { IoMdClose } from "react-icons/io";
import { MdOutlineArrowBackIosNew as ArrowBackward } from "react-icons/md"
import { MdOutlineArrowForwardIos as ArrowForward } from "react-icons/md"
import { v4 as uuidv4 } from "uuid"

// change visible statuses
// add custom statuses
type FormType = {
	statuses: Array<Status>
	statusesToDisplay: Array<String>
}
export const StatusForm = () => {
	const dispatch = useAppDispatch()
	const board = useAppSelector((state) => state.board)
	const defaultForm = {
		"statuses": [...board.statuses],	
		"statusesToDisplay": [...board.statusesToDisplay]
	}
	const [form, setForm] = useState<FormType>(defaultForm)
	const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null)

	useEffect(() => {
		setSelectedStatusId(null)	
	}, [board.showModal])

	const addStatus = () => {
		const prevMaxOrder = Math.max(...form.statuses.map((status)=>status.order))
		const newStatus: Status =  {
			id: uuidv4(),
			order: prevMaxOrder + 1,
			name: "New Status"
		}
		setForm({
			...form,
			statuses: [...form.statuses, newStatus]
		})
		setSelectedStatusId(newStatus.id)
	}

	const removeStatus = () => {
		const index = form.statuses.findIndex((status) => status.id === selectedStatusId)
		// if deleting an index in the middle of the list, make sure the order of each
		// element after is decremented by one
		let updated = form.statuses.map((status, i) => {
			if (i > index){
				return {...status, order: status.order - 1}
			}
			else {
				return status
			}
		})
		// remove the status from the status list
		updated.splice(index, 1)	
		setForm({
			...form,
			statuses: updated,
			statusesToDisplay: form.statusesToDisplay.filter((statusId) => statusId !== selectedStatusId)
		})	
		// remove the status from status to display list
		setSelectedStatusId(null)
	}

	const onChangeName = (value: string) => {
		const index = form.statuses.findIndex((status) => status.id === selectedStatusId)
		const status = form.statuses[index]
		if (status){
			let temp = form.statuses.map((status) => ({...status}))
			temp.splice(index, 1, {...status, name: value})
			setForm({
				...form,
				statuses: temp,
			})
		}
	}

	const onSubmit = () => {
		dispatch(updateStatuses(form.statuses))
		dispatch(updateStatusesToDisplay(form.statusesToDisplay))
		dispatch(toggleShowModal(false))
		setSelectedStatusId(null)
	}		

	const onCheck = () => {
		if (selectedStatusId){
			const statusIndex = form.statuses.findIndex((status) => status.id === selectedStatusId)
			const status = form.statuses[statusIndex]
			if (status){
				const isVisible = form.statusesToDisplay.includes(status.id)
				let temp = [...form.statusesToDisplay]
				if (isVisible){
					let i = temp.indexOf(status.id)
					temp.splice(i, 1)
				}
				else {
					temp.push(selectedStatusId)
				}
				setForm({...form, statusesToDisplay: temp})
			}
		}
	}

	const setOrder = (statusId: String, isBackwards: boolean) => {
		const selectedStatusIndex = form.statuses.findIndex((status: Status) => status.id === statusId)	
		const selectedStatus = form.statuses[selectedStatusIndex]
		// you cannot move order of 1 any further backwards
		if (selectedStatus && 
			(
				(isBackwards && selectedStatus.order !== 1) || 
				(!isBackwards && selectedStatus.order !== form.statuses.length)
			)
		){
			// find the element that was previously one behind and swap places with this element
			const previousIndex = form.statuses.findIndex((status: Status) => (isBackwards ? (selectedStatus.order - 1 === status.order) : selectedStatus.order + 1 === status.order))
			const previous = form.statuses[previousIndex]
			if (previous){
				let temp = form.statuses.map(status => ({...status})) 
				let tempPrevOrder = previous.order
				let tempSelectedOrder = selectedStatus.order
				temp.splice(selectedStatusIndex, 1, {...selectedStatus, order: tempPrevOrder})
				temp.splice(previousIndex, 1, {...previous, order: tempSelectedOrder})
				setForm({...form, statuses: temp})
			}
		}	
	}

	return (
		<div className = "container">
			<div className = "status-col">
				<p>Click on the status below to change its order, edit its name, change its visibility or remove it.</p>
				<p>Click "Save Changes" to commit changes to the statuses once you're done. </p>
				<div className = "form-row">
					<div className = "btn-group">
						{[...form.statuses].sort(sortStatusByOrder).map((status: Status) => {
							return (
								<div key = {status.id}>
									<button 
										className = {`${selectedStatusId === status.id ? "--selected": ""}`} 
										onClick = {() => {
											setSelectedStatusId(status.id === selectedStatusId ? null : status.id)}
										}>
										{status.name}
									</button>
								</div>
							)
						})}
					</div>
				</div>
				{selectedStatusId != null ? 
					<>
						<div className = "form-row">
							<div className = "btn-group">
								<button className = "--transparent" onClick = {(e) => setOrder(selectedStatusId, true)}><ArrowBackward /></button>
								<button className = "--transparent" onClick = {(e) => setOrder(selectedStatusId, false)}><ArrowForward /></button>
							</div>
						</div>
						<div className = "form-row">
							<div className = "form-cell">
								<label>Is visible in table:</label>
								<input type = "checkbox" onChange = {(e) => onCheck()} checked = {form.statusesToDisplay.includes(selectedStatusId)}/>
							</div>
						</div>
						<div className = "form-row">
							<div className = "form-cell">
								<label>Edit Status Name</label>
								<input type = "text" className = "" value = {form.statuses.find((status) => status.id === selectedStatusId)?.name} onChange = {(e) => onChangeName(e.target.value)} />
							</div>
						</div>
					</>
				: null}
				<div className = "form-row">
					<div className = "btn-group">
						<button onClick={onSubmit}>Save Changes</button>	
						<button onClick={addStatus}>Add Status</button>	
						{
							// you can only remove statuses that don't have any tickets associated with that status
							selectedStatusId != null && !doTicketsContainStatus(selectedStatusId, board.tickets) ? (
								<button onClick = {removeStatus} className = "--alert">Remove Status</button>) : null
						}
					</div>
				</div>
			</div>
		</div>
	)	
}