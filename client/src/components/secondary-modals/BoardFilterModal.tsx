import React from "react"
import { BoardFilterForm } from "../forms/BoardFilterForm"

interface Props {
    boardId: number
    isBulkEdit?: boolean
}

export const BoardFilterModal = ({boardId, isBulkEdit=false}: Props) => {
    return (
        <BoardFilterForm boardId={boardId} isBulkEdit={isBulkEdit}/>
    )
}
