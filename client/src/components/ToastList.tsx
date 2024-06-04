import React, { useRef, useEffect } from "react"
import { Toast } from "./Toast"
import { Toast as ToastType } from "../types/common" 
import "../styles/toast-list.css"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { updateToast, removeToast as removeToastAction } from "../slices/toastSlice"

export const ToastList = () => {
	const listRef = useRef<HTMLDivElement | null>(null)
	const { toasts, position } = useAppSelector((state) => state.toast)
	const prevToasts = useRef<Array<ToastType>>(toasts)
	const dispatch = useAppDispatch()

	useEffect(() => {
		handleScrolling(listRef.current)
	}, [position, toasts])

	useEffect(() => {
		if (prevToasts.current.length < toasts.length){
			// find the toast that was just added
			const prevToastIds = prevToasts.current.map((toast) => toast.id)
			const toastIds = toasts.map((toast) => toast.id)
			const addedToastId = toastIds.find((id) => !prevToastIds.includes(id))
			if (addedToastId){
				setTimeout(() => {
					animateToastRemoval(addedToastId)
				}, 3000)
			}
		}
		prevToasts.current = toasts
	}, [toasts])

	// animate the removal of the toast from the list by setting the animation type
	// of the toast to "animation-out"
	const animateToastRemoval = (id: string) => {
		const toast = toasts.find((toast) => toast.id === id)
		if (toast){
			dispatch(updateToast({toast: {...toast, animationType: "animation-out"}, toastId: id}))
		}
	}

	const handleScrolling = (el: HTMLDivElement | null) => {
		const isTopPosition = ["top-left", "top-right"].includes(position)
		isTopPosition ? el?.scrollTo(0, el.scrollHeight) : el?.scrollTo(0, 0)
	}

	const animationHandler = (id: string) => {
		const toast = toasts.find((toast) => toast.id === id)
		if (toast && toast.animationType === "animation-out"){
			dispatch(removeToastAction(id))
		}
	}

	const animationStyle = (toast: ToastType) => {
		if (position === "bottom-right" || position === "top-right"){
			return {
				"animation": `${toast.animationType === "animation-in" ? "toast-in-right" : "toast-out-right"} var(--toast-speed)` 
			}
		}
		else {
			return {
				"animation": `${toast.animationType === "animation-in" ? "toast-in-left" : "toast-out-left"} var(--toast-speed)` 
			}
		}
	}

	const sortedToasts = position.includes("bottom") ? [...toasts].reverse() : [...toasts]

	return (
		<div 
			ref = {listRef} className={`toast-list --${position}`} aria-live="assertive">
			{sortedToasts.map((toast: ToastType) => (
				<Toast
					key={toast.id}
					animationHandler={animationHandler}
					animationStyle={animationStyle(toast)}
					id={toast.id}
					message={toast.message}
					type={toast.type}
					onClose={() => animateToastRemoval(toast.id)}
				/>
			))}	
		</div>
	)
}