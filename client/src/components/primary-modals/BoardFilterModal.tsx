import React from "react"
import { BoardScheduleFilterForm } from "../forms/BoardScheduleFilterForm"

export type BoardFilterTypes = "SCHEDULE" | "BOARD" | "SPRINT" | "TABLE"

interface Props {
    boardId: number
    type: BoardFilterTypes
}

export const BoardFilterModal = ({type, boardId}: Props) => {
    if (type === "SCHEDULE"){
        return (
            <BoardScheduleFilterForm boardId={boardId}/>
        )
    }
}
