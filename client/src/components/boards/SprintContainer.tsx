import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetSprintsQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

interface Props {
    boardId: number
}

export const SprintContainer = ({boardId}: Props) => {
    const dispatch = useAppDispatch()
    const { data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading} = useGetSprintsQuery({urlParams: {
        boardId: boardId,
        recent: true
    }})
    const [trigger, { data: sprintTicketData, isFetching: isSprintTicketFetching, isLoading: isSprintTicketLoading, isError: isSprintTicketError }] = useLazyGetSprintTicketsQuery()

    useEffect(() => {
        if (sprintData && !isSprintLoading){
            // get the tickets for the most recent sprint
            trigger({sprintId: sprintData?.data?.[0]?.id ?? 0, urlParams: {}})
        }
    }, [sprintData, isSprintLoading])

	const editSprint = () => {
        if (sprintData?.data.length){
            dispatch(setModalType("SPRINT_FORM"))
            dispatch(setModalProps({
                boardId: boardId,
                sprintId: sprintData.data?.[0]?.id ?? 0
            }))
            dispatch(toggleShowModal(true))
        }
	}

    return (
        isSprintTicketLoading && isSprintLoading && !sprintTicketData && !sprintData ? (
            <LoadingSkeleton>
                <RowPlaceholder/>
            </LoadingSkeleton>
        ) : (
            sprintData && sprintData.data.length ? (
                <BulkEditTicketContainer action={editSprint} actionText={"Edit Sprint"} title={sprintData?.data?.[0]?.name ?? ""} tickets={sprintTicketData?.data ?? []}/>
            ) : null
        )
    )
}