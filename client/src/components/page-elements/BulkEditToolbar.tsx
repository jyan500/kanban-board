import React from "react"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { IoMdClose } from "react-icons/io";
import { toggleToolbar, toggleSelectAll, updateIds } from "../../slices/bulkEditSlice"

type Props = {
	applyActionToAll: (ids: Array<number>) => void
	text: string
}

export const BulkEditToolbar = ({applyActionToAll, text}: Props) => {
	const { ids: itemIds, displayToolbar } = useAppSelector((state) => state.bulkEdit) 
	const dispatch = useAppDispatch()
	return (
		itemIds.length > 0 ? 
		<div className = "tw-flex tw-flex-row tw-items-center tw-relative tw-border tw-w-full tw-gap-x-2 tw-p-4 tw-rounded-md">
			<button onClick={() => {
				dispatch(updateIds([]))
			}
			}>
				<IoMdClose className = "icon close-button"/>
			</button>
			<div><p className = "tw-font-bold tw-text-lg">{itemIds.length} Selected</p></div>
			<div>
				<button onClick={(e) => dispatch(updateIds([]))} className = "button !tw-bg-secondary">Unselect All</button>
				<button onClick={(e) => applyActionToAll(itemIds)} className = "button">{text}</button>
			</div>
		</div> : null
	)
}