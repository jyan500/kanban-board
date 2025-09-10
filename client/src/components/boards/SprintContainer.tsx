import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetSprintsQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"

interface Props {
    itemIds: Array<number>
    setItemId: (id: number) => void
    boardId: number
}

export const SprintContainer = ({itemIds, setItemId, boardId}: Props) => {
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

    const onCheck = (id: number) => {
        setItemId(id)
    }

    return (
        isSprintTicketLoading && isSprintLoading && !sprintTicketData && !sprintData ? (
            <LoadingSkeleton>
                <RowPlaceholder/>
            </LoadingSkeleton>
        ) : (
            sprintData && sprintData.data.length ? (
                <BulkEditTicketContainer itemIds={itemIds} action={editSprint} onCheck={onCheck} actionText={"Edit Sprint"} title={sprintData?.data?.[0]?.name ?? ""} totalTickets={sprintTicketData?.pagination.total ?? 0} tickets={sprintTicketData?.data ?? []}/>
            ) : null
        )
    )
}