import React, { useRef, useEffect } from "react"
import { Toast } from "./Toast"
import { Toast as ToastType } from "../types/common" 
import "../styles/toast-list.css"

type Props = {
	data: Array<ToastType>
	position: string
	removeToast: (id: string) => void
}

export const ToastList = ({data, position, removeToast}: Props) => {
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
		<div ref = {listRef} className={`toast-list --${position}`} aria-live="assertive">
			{sortedData.map((toast: ToastType) => (
				<Toast
					key={toast.id}
					message={toast.message}
					type={toast.type}
					onClose={() => removeToast(toast.id)}
				/>
			))}	
		</div>
	)
}