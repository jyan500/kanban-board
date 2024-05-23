import React, { useState, useEffect } from "react"
import { ToastList } from "./ToastList" 
import { addToast, setToasts } from "../slices/toastSlice" 
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { v4 as uuidv4 } from "uuid"

export const ToastListWrapper = () => {
	const { toasts } = useAppSelector((state) => state.toast)
	const dispatch = useAppDispatch()
	const removeToast = (id: string) => {
		dispatch(setToasts(toasts.filter((t) => t.id !== id)))
	}
	return (
		<div>
			<button onClick={(e) => 
				dispatch(addToast({
					id: uuidv4(),
					message: "toast added successfully",
					type: "warning",
				}))
			}>Add Toast</button>
			<ToastList
				data={toasts}
				position={"bottom-right"}
				removeToast={removeToast}
			/>
		</div>
	)
}