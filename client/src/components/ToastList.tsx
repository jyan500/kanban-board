import React, { useRef, useEffect } from "react"
import { Toast } from "./Toast"
import { Toast as ToastType } from "../types/common" 
import "../styles/toast-list.css"
import { useAppDispatch } from "../hooks/redux-hooks" 
import { removeToast as removeToastAction } from "../slices/toastSlice"

type Props = {
	data: Array<ToastType>
	position: string
	removeToast: (id: string) => void
}

export const ToastList = ({data, position, removeToast}: Props) => {
	const listRef = useRef<HTMLDivElement | null>(null)
	const dispatch = useAppDispatch()
	useEffect(() => {
		handleScrolling(listRef.current)
	}, [position, data])

	const handleScrolling = (el: HTMLDivElement | null) => {
		const isTopPosition = ["top-left", "top-right"].includes(position)
		isTopPosition ? el?.scrollTo(0, el.scrollHeight) : el?.scrollTo(0, 0)
	}

	const animationHandler = (id: string) => {
		const toast = data.find((toast) => toast.id === id)
		if (toast && toast.animationType === "animation-out"){
			dispatch(removeToastAction(id))
		}
	}

	const sortedData = position.includes("bottom") ? [...data].reverse() : [...data]

	return (
		<div 
			ref = {listRef} className={`toast-list --${position}`} aria-live="assertive">
			{sortedData.map((toast: ToastType) => (
				<Toast
					key={toast.id}
					animationHandler={animationHandler}
					animationStyle={
						{
							"animation": `${toast.animationType === "animation-in" ? "toast-in-right" : "toast-out-right"} var(--toast-speed)` 
						}
					}
					id={toast.id}
					message={toast.message}
					type={toast.type}
					onClose={() => removeToast(toast.id)}
				/>
			))}	
		</div>
	)
}