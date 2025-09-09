import React from "react"
import { BulkEditToolbar } from "../page-elements/BulkEditToolbar"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { setItemIds } from "../../slices/toolbarSlice"

export const BacklogToolbar = () => {
    const dispatch = useAppDispatch()
    const { itemIds } = useAppSelector((state) => state.toolbar)
    return (
        <BulkEditToolbar
            updateIds={(ids: Array<number>) => dispatch(setItemIds(ids))}
            itemIds={itemIds}
        />
    )
}