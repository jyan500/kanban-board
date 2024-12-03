import React, { useState } from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { IoMdClose } from "react-icons/io";

type Props = {
	applyActionToAll: (ids: Array<number>) => void
	updateIds: (ids: Array<number>) => void
	text: string
	itemIds: Array<number>
}

export const BulkEditToolbar = ({itemIds, applyActionToAll, text, updateIds}: Props) => {
	return (
		itemIds.length > 0 ? 
		<div className = "tw-flex tw-flex-row tw-items-center tw-relative tw-border tw-w-full tw-gap-x-2 tw-p-4 tw-rounded-md">
			<button onClick={() => {
				updateIds([])
			}
			}>
				<IoMdClose className = "icon close-button"/>
			</button>
			<div><p className = "tw-font-bold tw-text-lg">{itemIds.length} Selected</p></div>
			<div>
				<button onClick={(e) => updateIds([])} className = "button !tw-bg-secondary">Unselect All</button>
				<button onClick={(e) => applyActionToAll(itemIds)} className = "button">{text}</button>
			</div>
		</div> : null
	)
}