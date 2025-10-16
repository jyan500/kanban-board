import React, { useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { IoMdClose } from "react-icons/io";
import { Button } from "./Button"

type Props = {
	applyActionToAll?: (ids: Array<number>) => void
	applyRemoveToAll?: (ids: Array<number>) => void
	updateIds: (ids: Array<number>) => void
	actionText?: string
	removeText?: string
	itemIds: Array<number>
	children?: React.ReactNode
}

export const BulkEditToolbar = ({itemIds, applyActionToAll, applyRemoveToAll, actionText, removeText, updateIds, children}: Props) => {
	return (
		itemIds.length > 0 ? 
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-items-center tw-relative tw-border tw-w-full tw-gap-x-2 tw-p-4 tw-rounded-md tw-shadow">
			<button onClick={() => {
				updateIds([])
			}
			}>
				<IoMdClose className = "icon close-button"/>
			</button>
			<div><p className = "tw-font-bold tw-text-lg">{itemIds.length} Selected</p></div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				{children}
				<Button theme="secondary" onClick={(e) => updateIds([])}>Unselect All</Button>
				{
					applyActionToAll && actionText ? 
						<Button theme="primary" onClick={(e) => applyActionToAll(itemIds)}>{actionText}</Button>
					: null
				}
				{
					applyRemoveToAll && removeText ? 
						<Button theme="alert" onClick={(e) => applyRemoveToAll(itemIds)}>{removeText}</Button>
					: null
				}
			</div>
		</div> : null
	)
}
