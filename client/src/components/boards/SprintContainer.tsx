import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { useGetSprintsQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { ListResponse, Sprint, Ticket } from "../../types/common"
import { PaginationRow } from "../page-elements/PaginationRow"
import { useForm, FormProvider, useFormContext} from "react-hook-form"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { FormValues } from "../../pages/boards/BoardBacklog"

interface Props {
    itemIds: Array<number>
    page: number
    setPage: (page: number) => void
    setItemId: (id: number) => void
    sprintData?: ListResponse<Sprint>
    isLoading?: boolean
    sprintTicketData?: ListResponse<Ticket>
    onSubmit: (values: FormValues) => void
    boardId: number
}

export const SprintContainer = ({
    page, 
    setPage, 
    isLoading, 
    itemIds, 
    setItemId, 
    sprintData, 
    sprintTicketData, 
    boardId,
    onSubmit
}: Props) => {
    const dispatch = useAppDispatch()

    const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods

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
                searchBar={
                    <div className = "tw-flex tw-flex-row tw-justify-between">
                        <FormProvider {...methods}>
                            <SearchToolBar 
                                paginationData={sprintTicketData?.pagination} 
                                setPage={setPage} 
                                currentPage={page ?? 1}
                                registerOptions={{}}
                                searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
                                onFormSubmit={async () => {
                                    await handleSubmit(onSubmit)()
                                }}
                                hidePagination={true}
                            >
                            </SearchToolBar>
                        </FormProvider>
                        {
                            sprintTicketData?.pagination.nextPage || sprintTicketData?.pagination.prevPage ? (
                                <div className="">
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
                    </div>
                }
                />
        ) : null
    )
}