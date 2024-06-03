import React, { useEffect, useRef, useState } from "react"
import { ToastList } from "./ToastList" 
import { 
	addToast, 
	removeToast as removeToastAction, 
	updateToast,
} from "../slices/toastSlice" 
import { Toast as ToastType } from "../types/common"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { v4 as uuidv4 } from "uuid"

export const ToastListWrapper = () => {
	const { toasts } = useAppSelector((state) => state.toast)
	const prevToasts = useRef(toasts)
	const dispatch = useAppDispatch()
	const removeToast = (id: string) => {
		// animate the removal of the toast from the list
		const toast = toasts.find((toast) => toast.id === id)
		if (toast){
			dispatch(updateToast({toast: {...toast, animationType: "animation-out"}, toastId: id}))
		}
	}

	useEffect(() => {
		if (prevToasts.current.length < toasts.length){
			// find the toast that was just added
			const prevToastIds = prevToasts.current.map((toast) => toast.id)
			const toastIds = toasts.map((toast) => toast.id)
			const addedToastId = toastIds.find((id) => !prevToastIds.includes(id))
			if (addedToastId){
				setTimeout(() => {
					removeToast(addedToastId)
				}, 3000)
			}
		}
		prevToasts.current = toasts
	}, [toasts])


	return (
		<div>
			<button onClick={(e) => {
				const id = uuidv4()
				dispatch(addToast({
					id: id,	
					message: "toast added successfully!",
					type: "failure",
					animationType: "animation-in"
				}))
			}

			}>Add Toast</button>
			<ToastList
				data={toasts}
				position={"bottom-right"}
				removeToast={removeToast}
			/>
		</div>
	)
}