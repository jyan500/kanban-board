import React from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

interface Props {
    boardId: number
}

export const BacklogContainer = ({boardId}: Props) => {
    const dispatch = useAppDispatch()
    const { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError } = useGetBoardTicketsQuery({id: boardId, urlParams: {
		"includeAssignees": true, 
		"includeRelationshipInfo": true, 
		"limit": true,
	}})

	const createSprint = () => {
		dispatch(setModalType("SPRINT_FORM"))
		dispatch(setModalProps({
			boardId: boardId
		}))
		dispatch(toggleShowModal(true))
	}

    return (
        isBoardTicketLoading && !boardTicketData ? (
            <LoadingSkeleton>
                <RowPlaceholder/>
            </LoadingSkeleton>
        ) : (
            <BulkEditTicketContainer action={createSprint} actionText={"Create Sprint"} title={"Backlog"} tickets={boardTicketData?.data ?? []}/>
        )
    )
}