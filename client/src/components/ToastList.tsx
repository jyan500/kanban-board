import React, { useRef, useEffect } from "react"
import { Toast } from "./Toast"
import { Toast as ToastType } from "../types/common" 
import "../styles/toast-list.css"

type Props = {
	data: Array<ToastType>
	position: string
	removeToast: (id: string) => void
	animationType: string
	animationHandler: Function
	toastId?: string
}

export const ToastList = ({data, toastId, position, removeToast, animationType, animationHandler}: Props) => {
	const listRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		handleScrolling(listRef.current)
	}, [position, data])

	const handleScrolling = (el: HTMLDivElement | null) => {
		const isTopPosition = ["top-left", "top-right"].includes(position)
		isTopPosition ? el?.scrollTo(0, el.scrollHeight) : el?.scrollTo(0, 0)
	}

	const sortedData = position.includes("bottom") ? [...data].reverse() : [...data]

	return (
		<div 
			onAnimationEnd={(e) => animationHandler()}
			ref = {listRef} className={`toast-list --${position}`} aria-live="assertive">
			{sortedData.map((toast: ToastType) => (
				<Toast
					key={toast.id}
					animationStyle={
						toastId && toastId === toast.id ? {
							"animation": `${animationType === "animation-in" ? "toast-in-right" : "toast-out-right"} var(--toast-speed)`} 
						: {}
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