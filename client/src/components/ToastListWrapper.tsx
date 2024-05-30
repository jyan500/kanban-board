import React, { useState } from "react"
import { ToastList } from "./ToastList" 
import { addToast, removeToast as removeToastAction } from "../slices/toastSlice" 
import { Toast as ToastType } from "../types/common"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks" 
import { v4 as uuidv4 } from "uuid"
import { addToast as addToastHelper } from "../helpers/functions" 

export const ToastListWrapper = () => {
	const { toasts } = useAppSelector((state) => state.toast)
	const [animationType, setAnimationType] = useState<string>("animation-in")
	const [toastId, setToastId] = useState<string>()
	const dispatch = useAppDispatch()
	const removeToast = (id: string) => {
		// animate the removal of the toast from the list
		setAnimationType("animation-out")
		setToastId(id)
	}

	const animateInHandler = () => {
	}

	const animateOutHandler = () => {
		// once the animation for the removal of the toast is finished,
		// remove the toast element from the list
		if (toastId){
			dispatch(removeToastAction(toastId))
		}
		setAnimationType("animation-in")
	}

	return (
		<div>
			<button onClick={(e) => {
				setAnimationType("animation-in")
				const id = uuidv4()
				setToastId(id)
				addToastHelper({
					id: id,	
					message: "toast added successfully!",
					type: "failure"
				}, dispatch, addToast, removeToastAction, false)}
			}>Add Toast</button>
			<ToastList
				data={toasts}
				toastId={toastId}
				position={"bottom-right"}
				removeToast={removeToast}
				animationType={animationType}
				animationHandler={animationType === "animation-in" ? animateInHandler : animateOutHandler}
			/>
		</div>
	)
}