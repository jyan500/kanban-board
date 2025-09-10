import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { PaginationRow } from "../page-elements/PaginationRow"
import { ListResponse, Ticket } from "../../types/common"

interface Props {
    itemIds: Array<number>
    page: number
    setPage: (page: number) => void
    boardTicketData?: ListResponse<Ticket>
    setItemId: (id: number) => void
    isLoading?: boolean
    boardId: number
}

export const BacklogContainer = ({
    itemIds, 
    page, 
    setPage, 
    boardTicketData, 
    setItemId, 
    boardId,
    isLoading
}: Props) => {
    const dispatch = useAppDispatch()

	const createSprint = () => {
		dispatch(setModalType("SPRINT_FORM"))
		dispatch(setModalProps({
			boardId: boardId
		}))
		dispatch(toggleShowModal(true))
	}

    const onCheck = (id: number) => {
        setItemId(id)
    }

    return (
        <div className = "tw-flex tw-flex-col tw-gap-y-4">
            <BulkEditTicketContainer 
                action={createSprint} 
                actionText={"Create Sprint"} 
                title={
                    <span className = "tw-font-medium">Backlog</span>
                } 
                totalTickets={boardTicketData?.pagination.total ?? 0} 
                onCheck={onCheck}
                isLoading={isLoading}
                itemIds={itemIds}
                tickets={boardTicketData?.data ?? []}
                pagination={
                    <>
                    {
                        boardTicketData?.pagination.nextPage || boardTicketData?.pagination.prevPage ? (
                            <div className="lg:tw-pr-4 tw-pb-2 tw-pl-2 tw-w-full tw-flex tw-flex-row lg:tw-justify-end">
                                <PaginationRow
                                    showNumResults={true}
                                    showPageNums={false}
                                    setPage={setPage}	
                                    paginationData={boardTicketData?.pagination}
                                    currentPage={page}
                                />
                            </div>
                        ) : null
                    }
                    </>
                }
            />
        </div>
    )
}