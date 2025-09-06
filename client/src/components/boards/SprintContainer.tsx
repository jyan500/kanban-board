import React from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

interface Props {
    boardId: number
    sprintName: string
    sprintId: number
}

export const SprintContainer = ({boardId, sprintName, sprintId}: Props) => {
    const dispatch = useAppDispatch()
    const { data: sprintTicketData, isFetching: isSprintTicketFetching, isLoading: isSprintTicketLoading, isError: isSprintTicketError } = useGetSprintTicketsQuery({sprintId: sprintId, urlParams: {}})

	const editSprint = () => {
		dispatch(setModalType("SPRINT_FORM"))
		dispatch(setModalProps({
			boardId: boardId,
            sprintId: sprintId
		}))
		dispatch(toggleShowModal(true))
	}

    return (
        isSprintTicketLoading && !sprintTicketData ? (
            <LoadingSkeleton>
                <RowPlaceholder/>
            </LoadingSkeleton>
        ) : (
            <BulkEditTicketContainer action={editSprint} actionText={"Edit Sprint"} title={sprintName} tickets={sprintTicketData?.data ?? []}/>
        )
    )
}