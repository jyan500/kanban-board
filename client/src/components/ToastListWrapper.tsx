import React, { useState, useEffect } from "react"
import { ToastList } from "./ToastList" 
import { setToasts } from "../slices/toastSlice" 
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 

export const ToastListWrapper = () => {
	const { toasts } = useAppSelector((state) => state.toast)
	const dispatch = useAppDispatch()
	const removeToast = (id: string) => {
		setToasts(toasts.filter((t) => t.id !== id))	
	}
	return (
		<ToastList
			data={toasts}
			position={"bottom-left"}
			removeToast={removeToast}
		/>
	)
}