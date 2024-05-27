import React, { useState } from "react"
import { ToastList } from "./ToastList" 
import { addToast, removeToast as removeToastAction } from "../slices/toastSlice" 
import { Toast as ToastType } from "../types/common"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { v4 as uuidv4 } from "uuid"
import { addToast as addToastHelper } from "../helpers/functions" 

export const ToastListWrapper = () => {
	const { toasts } = useAppSelector((state) => state.toast)
	const dispatch = useAppDispatch()
	const removeToast = (id: string) => {
		dispatch(removeToastAction(id))
	}
	return (
		<div>
			<button onClick={(e) => 
				addToastHelper({
					id: uuidv4(),	
					message: "toast added successfully!",
					type: "failure"
				}, dispatch, addToast, removeToastAction)
			}>Add Toast</button>
			<ToastList
				data={toasts}
				position={"bottom-right"}
				removeToast={removeToast}
			/>
		</div>
	)
}