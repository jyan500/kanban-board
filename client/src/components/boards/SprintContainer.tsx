import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetSprintsQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { ListResponse, Sprint, Ticket } from "../../types/common"
import { PaginationRow } from "../page-elements/PaginationRow"

interface Props {
    itemIds: Array<number>
    page: number
    setPage: (page: number) => void
    setItemId: (id: number) => void
    sprintData?: ListResponse<Sprint>
    isLoading?: boolean
    sprintTicketData?: ListResponse<Ticket>
    boardId: number
}

export const SprintContainer = ({page, setPage, isLoading, itemIds, setItemId, sprintData, sprintTicketData, boardId}: Props) => {
    const dispatch = useAppDispatch()

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
        sprintData && sprintData.data.length ? (
            <BulkEditTicketContainer 
                itemIds={itemIds} 
                action={editSprint} 
                onCheck={onCheck} 
                actionText={"Edit Sprint"} 
                isLoading={isLoading}
                title={
                    <div className = "tw-flex tw-flex-row tw-gap-x-2">
                        <span className = "tw-font-medium">{sprintData?.data?.[0]?.name ?? ""}</span>
                        <span className = "tw-text-gray-600">{new Date(sprintData?.data?.[0]?.startDate).toLocaleDateString()} to {new Date(sprintData?.data?.[0]?.endDate).toLocaleDateString()}</span>
                    </div>
                } 
                totalTickets={sprintTicketData?.pagination?.total ?? 0} 
                tickets={sprintTicketData?.data ?? []}
                pagination={
                    <>
                    {
                        sprintTicketData?.pagination.nextPage || sprintTicketData?.pagination.prevPage ? (
                            <div className="lg:tw-pr-4 tw-pb-2 tw-pl-2 tw-w-full tw-flex tw-flex-row lg:tw-justify-end">
                                <PaginationRow
                                    showNumResults={true}
                                    showPageNums={false}
                                    setPage={setPage}	
                                    paginationData={sprintTicketData?.pagination}
                                    currentPage={page}
                                />
                            </div>
                        ) : null
                    }
                    </>
                }
                />
        ) : null
    )
}