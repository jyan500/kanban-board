import React, { useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { IoMdClose } from "react-icons/io";

type Props = {
	applyActionToAll: (ids: Array<number>) => void
	applyRemoveToAll?: (ids: Array<number>) => void
	updateIds: (ids: Array<number>) => void
	actionText: string
	removeText?: string
	itemIds: Array<number>
}

export const BulkEditToolbar = ({itemIds, applyActionToAll, applyRemoveToAll, actionText, removeText, updateIds}: Props) => {
	return (
		itemIds.length > 0 ? 
		<div className = "tw-flex tw-flex-row tw-items-center tw-relative tw-border tw-w-full tw-gap-x-2 tw-p-4 tw-rounded-md tw-shadow">
			<button onClick={() => {
				updateIds([])
			}
			}>
				<IoMdClose className = "icon close-button"/>
			</button>
			<div><p className = "tw-font-bold tw-text-lg">{itemIds.length} Selected</p></div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<button onClick={(e) => updateIds([])} className = "button !tw-bg-secondary">Unselect All</button>
				<button onClick={(e) => applyActionToAll(itemIds)} className = "button">{actionText}</button>
				{
					applyRemoveToAll && removeText ? 
						<button onClick={(e) => applyRemoveToAll(itemIds)} className = "button --alert">{removeText}</button>
					: null
				}
			</div>
		</div> : null
	)
}
