import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import type { Status, Toast } from "../../types/common" 
import { addToast } from "../../slices/toastSlice" 
import { 
	useGetStatusesQuery, 
	useAddStatusMutation, 
	useUpdateStatusMutation, 
	useBulkEditStatusesMutation,
	useUpdateOrderMutation
} from "../../services/private/status"
import { toggleShowModal } from "../../slices/modalSlice"
import { sortStatusByOrder } from "../../helpers/functions" 
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { LoadingSpinner } from "../LoadingSpinner"
import { IoIosArrowDown as ArrowDown, IoIosArrowUp as ArrowUp } from "react-icons/io";
import { IconButton } from "../page-elements/IconButton"

type FormValues = {
	id?: number
	name: string
	isActive: boolean
}

export const OrganizationStatusModal = () => {
	const dispatch = useAppDispatch()
	const { statuses } = useAppSelector((state) => state.status)
	const { showModal } = useAppSelector((state) => state.modal) 
	const { data: statusData, isLoading: isStatusDataLoading } = useGetStatusesQuery({})
	const [formStatuses, setFormStatuses] = useState<Array<Status>>()
	const [ bulkEditStatuses, {isLoading: isLoading, error: isError} ] =  useBulkEditStatusesMutation() 
	const [ addStatus, {isLoading: isAddStatusLoading, error: isAddStatusError } ] = useAddStatusMutation()
	const [ updateStatus, {isLoading: isUpdateStatusLoading, error: isUpdateStatusError }] = useUpdateStatusMutation()
	const [ updateOrder, {isLoading: isUpdateOrderLoading, error: isUpdateOrderError}] = useUpdateOrderMutation()
	const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null)

	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		isActive: false
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	useEffect(() => {
		setSelectedStatusId(null)	
	}, [showModal])

	useEffect(() => {
		if (!isStatusDataLoading && statusData){
			setFormStatuses(statusData)
		}
	}, [isStatusDataLoading, statusData])

	const updateStatusOrder = async (statusId: number, newOrder: number) => {
		const toast: Toast = {
			id: uuidv4(),
			type: "failure",
			animationType: "animation-in",
			message: `Status could not be updated.`
		}
		if (formStatuses?.length){
			try  {
				const status = formStatuses.find((status) => status.id === statusId)
				// we also need to find the status that currently has the order and swap places
				const statusToSwap = formStatuses.find((status) => status.order === newOrder)
				if (status && statusToSwap){
					updateOrder([{
						id: status.id,
						order: newOrder
					},
					// the status that corresponds to the arrow we chose will take the place of the status
					// we want to swap, so we pass in the current order as the order for this case.
					{
						id: statusToSwap.id,
						order: status.order
					}])
				}
				else {
					dispatch(
						addToast(toast)
					)
				}
			}
			catch (e){
				dispatch(
					addToast(toast)
				)
			}
		}
	}

	const onSubmit = async (values: FormValues) => {
		const toast: Toast = {
			id: uuidv4(),
			type: "success",
			animationType: "animation-in",
			message: `Status ${values.id ? "updated" : "added"} successfully!`
		}
		try {
			if (formStatuses?.length){
				if (values.id){
					const order = formStatuses.find((status) => status.id === values.id)?.order
					await updateStatus({...values, id: values.id ?? 0, order: order ?? 0}).unwrap()
				}
				else {
					await addStatus(values).unwrap()
				}
			}
			dispatch(addToast(toast))
		}	
		catch (e){
			dispatch(addToast({...toast, type: "failure", message: `Status could not be ${values.id ? "updated" : "added"}`}))
		}
		// feset the form and clear out the selected id
		reset({
			id: undefined,	
			name: "",
			isActive: false
		})
		setSelectedStatusId(null)
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
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
			<p>Click on the buttons to edit the statuses, and arrows to change the order</p>
			{ !isStatusDataLoading && statusData?.length ? (statusData.map((status, index) => (
				<>
					<div className = "tw-flex tw-flex-row tw-justify-between">
						<button onClick = {(e) => {
							setSelectedStatusId(selectedStatusId === status.id ? null : status.id)
							reset({
								id: status.id,	
								name: status.name,
								isActive: status.isActive,
							})
						}} key = {status.id} className = "button">
							{status.name}
						</button>
						<div className = "tw-flex tw-flex-col tw-items-center">
							<IconButton disabled = {index === 0} onClick={() => updateStatusOrder(status.id, status.order - 1)}><ArrowUp className = "tw-w-6 tw-h-6"/></IconButton>
							<IconButton disabled = {index === statusData.length-1} onClick={() => updateStatusOrder(status.id, status.order + 1)}><ArrowDown className = "tw-w-6 tw-h-6"/></IconButton>
						</div>
					</div>
					{
						selectedStatusId === status.id ? 
						<div className = {`tw-flex tw-flex-col`}>
							<form onSubmit={handleSubmit(onSubmit)}>
								<div className = "">
									<label className = "label">Name</label>
									<input type = "text" {...register("name")}/>
							        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
								</div>
								<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
									<label className = "label">Visible</label>	
									<input type = "checkbox" {...register("isActive")}/>
								</div>
								<div>
									<button type = "submit" className = "button">Save</button>
								</div>
							</form>
						</div> : null
					}
				</>
			))) : <LoadingSpinner/>}
			{/*<button className = "button">Save Changes</button>	*/}
			{/*<button onClick={addStatus}>Add Status</button>*/}
			{
				// you can only remove statuses that don't have any tickets associated with that status
				// selectedStatusId != null && !doTicketsContainStatus(selectedStatusId, boardTicketIds) ? (
				// 	<button onClick = {removeStatus} className = "--alert">Remove Status</button>) : null
			}
		</div>
	)	}

