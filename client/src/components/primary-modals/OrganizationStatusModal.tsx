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
import { IoMdAdd as AddIcon } from "react-icons/io";

type FormValues = {
	id?: number
	name: string
	isActive: boolean
	isCompleted: boolean
}

export const OrganizationStatusModal = () => {
	const dispatch = useAppDispatch()
	const { statuses } = useAppSelector((state) => state.status)
	const { showModal } = useAppSelector((state) => state.modal) 
	const { data: statusData, isLoading: isStatusDataLoading } = useGetStatusesQuery({})
	const [ addStatus, {isLoading: isAddStatusLoading, error: addStatusError } ] = useAddStatusMutation()
	const [ updateStatus, {isLoading: isUpdateStatusLoading, error: updateStatusError }] = useUpdateStatusMutation()
	const [ updateOrder, {isLoading: isUpdateOrderLoading, error: updateOrderError}] = useUpdateOrderMutation()
	const [ selectedStatusId, setSelectedStatusId ] = useState<number | null>(null)
	const [ showNewStatus, setShowNewStatus ] = useState<boolean>(false)

	const defaultForm: FormValues = {
		id: undefined,
		name: "",
		isActive: false,
		isCompleted: false,
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const { register , handleSubmit, reset , setValue, getValues, formState: {errors} } = useForm<FormValues>({
		defaultValues: preloadedValues
	})

	useEffect(() => {
		setSelectedStatusId(null)	
	}, [showModal])

	const addUpdateForm = (option: "add" | "update") => {
		const error = option === "add" ? addStatusError : updateStatusError
		return (
			<form className = "tw-border tw-border-gray-100 tw-p-4" onSubmit={handleSubmit(onSubmit)}>
				{
					error && "status" in error ? (error.data.errors?.map((errorMessage: string, i: number) => <p className = "--text-alert" key = {`org_error_${i}`}>{errorMessage}</p>)) : null
				}
				<div className = {`tw-flex tw-flex-col tw-gap-y-2`}>
					<div className = "">
						<label htmlFor = "status-name" className = "label">Name</label>
						<input id = "status-name" type = "text" {...register("name")}/>
				        {errors?.name && <small className = "--text-alert">{errors.name.message}</small>}
					</div>
					<div className = "tw-flex tw-flex-row tw-gap-x-2">
						<input id = "status-is-active" type = "checkbox" {...register("isActive")}/>
						<label htmlFor = "status-is-active" className = "label">Is Active</label>	
					</div>
					<div>
						<small><span className = "tw-font-bold">*</span>check this off to display this status across all boards in this organization</small>	
					</div>
					<div className = "tw-flex tw-flex-row tw-gap-x-2">
						<input id = "status-is-completed" type = "checkbox" {...register("isCompleted")}/>
						<label htmlFor = "status-is-completed" className = "label">Is Completed</label>	
					</div>
					<div>
						<small><span className = "tw-font-bold">*</span>check this off so that all tickets in this status are considered "completed" for progress checking purposes</small>	
					</div>
					<div>
						<button type = "submit" className = "button">Save</button>
					</div>
				</div>
			</form>
		)
	}

	/* 
	This function is a fail safe in case the orders are not consecutive numbers when saved on the DB (due to deletions or other
	unforeseen circumstances, since the assumption is that the order attributes are normally in consecutive order 
	*/
	const findNextClosestOrder = (statusId: number, currentOrder: number, increase=false) => {
		// get all orders except the current status that is chosen
		if (statusData){
			const orders = statusData.filter((status) => status.id != statusId).map((status) => status.order)
			const lookup = new Set(orders)
			const max = Math.max(...orders)
			const min = Math.min(...orders)
			// if we're trying to get the next largest order, iterate starting from current order to the max until if we find it
			if (increase){
				for (let i = currentOrder; i <= max; ++i){
					if (lookup.has(i)){
						return i
					}
				}
			}
			// if we're trying to get the next smallest order, iterate starting from order to the min until if we find it
			else {
				for (let i = currentOrder; i >= min; --i){
					if (lookup.has(i)){
						return i
					}
				}
			}
		}
		return -1
	}

	const updateStatusOrder = async (statusId: number, newOrder: number) => {
		const toast: Toast = {
			id: uuidv4(),
			type: "failure",
			animationType: "animation-in",
			message: "Order could not be updated"
		}
		if (statusData?.length && newOrder !== -1){
			try  {
				const status = statusData.find((status) => status.id === statusId)
				// we also need to find the status that currently has the order and swap places
				const statusToSwap = statusData.find((status) => status.order === newOrder)
				// TODO: there are rare instances where the cache does not update
				// prevent two statuses from having the same order
				if (status && statusToSwap && newOrder !== status.order){
					await updateOrder([{
						id: status.id,
						order: newOrder
					},
					// the status that corresponds to the arrow we chose will take the place of the status
					// we want to swap, so we pass in the current order as the order for this case.
					{
						id: statusToSwap.id,
						order: status.order
					}]).unwrap()
					dispatch(addToast({
						...toast,
						type: "success",
						message: "Order was updated successfully!"
					}))
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
		else {
			dispatch(
				addToast(toast)
			)
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
			if (statusData?.length){
				if (values.id){
					const order = statusData.find((status) => status.id === values.id)?.order
					await updateStatus({...values, id: values.id ?? 0, order: order ?? 0}).unwrap()
				}
				else {
					// by default, set the status with the max order value + 1, so it shows up at the end of the list
					const order = Math.max(...statusData.map((status) => status.order)) + 1
					await addStatus({...values, order: order}).unwrap()
				}
			}
			dispatch(addToast(toast))
		}	
		catch (e){
			dispatch(addToast({...toast, type: "failure", message: `Status could not be ${values.id ? "updated" : "added"}`}))
		}
		// reset the form and clear out the selected id
		reset({
			id: undefined,	
			name: "",
			isActive: false,
			isCompleted: false,
		})
		setSelectedStatusId(null)
	}		

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-6">
			<div className = "tw-flex tw-flex-col tw-gap-y-2">
				<p className = "tw-font-bold">Click on the buttons to edit the statuses, and arrows to change the order</p>
				<div>
					<button onClick={(e) => {
						setShowNewStatus(!showNewStatus)
						setSelectedStatusId(null)
						reset({
							id: undefined,	
							name: "",
							isActive: false,
							isCompleted: false,
						})
					}} className = "button --secondary">
						<div className = "tw-flex tw-items-center tw-gap-x-2">
							<AddIcon/>
							<p>Add Status</p>
						</div>
					</button>
				</div>
				{
					showNewStatus ?  
						addUpdateForm("add") : null
				}
			</div>
			<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-border tw-border-gray-50 tw-shadow-md tw-p-4">
				{ !isStatusDataLoading && statusData?.length ? ([...statusData].sort(sortStatusByOrder).map((status, index) => (
					<>
						<div className = "tw-flex tw-flex-row tw-justify-between">
							<button onClick = {(e) => {
								setShowNewStatus(false)
								setSelectedStatusId(selectedStatusId === status.id ? null : status.id)
								reset({
									id: status.id,	
									name: status.name,
									isActive: status.isActive,
									isCompleted: status.isCompleted,
								})
							}} key = {status.id} className = "button">
								{status.name}
							</button>
							<div className = "tw-flex tw-flex-col tw-items-center">
								<IconButton disabled = {index === 0} onClick={() => updateStatusOrder(status.id, findNextClosestOrder(status.id, status.order, false))}><ArrowUp className = "tw-w-6 tw-h-6"/></IconButton>
								<IconButton disabled = {index === statusData.length-1} onClick={() => updateStatusOrder(status.id, findNextClosestOrder(status.id, status.order, true))}><ArrowDown className = "tw-w-6 tw-h-6"/></IconButton>
							</div>
						</div>
						{
							selectedStatusId === status.id ? 
							addUpdateForm("update") : null
						}
					</>
				))) : <LoadingSpinner/>}
			</div>
		</div>
	)
}


