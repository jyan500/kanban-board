import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { PaginationRow } from "../page-elements/PaginationRow"
import { setItemIds, setToolbarType, setToolbarProps, toggleShowToolbar } from "../../slices/toolbarSlice"

interface Props {
    boardId: number
}

export const BacklogContainer = ({boardId}: Props) => {
    const dispatch = useAppDispatch()
    const { itemIds, showToolbar } = useAppSelector((state) => state.toolbar)
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
        if (itemIds.includes(id)){
            dispatch(setItemIds(itemIds.filter((itemId) => itemId !== id)))
        }
        else {
            dispatch(setItemIds([...itemIds, id]))
        }
        dispatch(setToolbarType("BULK_EDIT_BACKLOG"))    
        dispatch(toggleShowToolbar(true))
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