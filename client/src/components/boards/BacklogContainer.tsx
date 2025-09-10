import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { PaginationRow } from "../page-elements/PaginationRow"

interface Props {
    itemIds: Array<number>
    setItemId: (id: number) => void
    boardId: number
}

export const BacklogContainer = ({itemIds, setItemId, boardId}: Props) => {
    const dispatch = useAppDispatch()
    const [page, setPage] = useState(1)
    const { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError } = useGetBoardTicketsQuery(boardId !== 0 ? {id: boardId, urlParams: {
        page,
		"includeAssignees": true, 
		"includeRelationshipInfo": true, 
		"limit": true,
	}} : skipToken)

	const createSprint = () => {
		dispatch(setModalType("SPRINT_FORM"))
		dispatch(setModalProps({
			boardId: boardId
		}))
		dispatch(toggleShowModal(true))
	}

    const onCheck = (id: number) => {
        setItemId(id)
        // if (itemIds.includes(id)){
        //     setItemIds(itemIds.filter((itemId) => itemId !== id))
        // }
        // else {
        //     setItemIds([...itemIds, id])
        // }
    }

    return (
        isBoardTicketLoading && !boardTicketData ? (
            <LoadingSkeleton>
                <RowPlaceholder/>
            </LoadingSkeleton>
        ) : (
            <div className = "tw-flex tw-flex-col tw-gap-y-4">
                <BulkEditTicketContainer 
                    action={createSprint} 
                    actionText={"Create Sprint"} 
                    title={"Backlog"} 
                    totalTickets={boardTicketData?.pagination.total ?? 0} 
                    onCheck={onCheck}
                    itemIds={itemIds}
                    tickets={boardTicketData?.data ?? []}
                    pagination={
                        <>
                        {
                            boardTicketData?.pagination.nextPage || boardTicketData?.pagination.prevPage ? (
                                <PaginationRow
                                    showNumResults={true}
                                    showPageNums={false}
                                    setPage={setPage}	
                                    paginationData={boardTicketData?.pagination}
                                    currentPage={page}
                                />
                            ) : null
                        }
                        </>
                    }
                />
            </div>
        )
    )
}