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
import { Badge } from "../page-elements/Badge"
import { Button } from "../page-elements/Button"
import { HoverTooltip } from "../page-elements/HoverTooltip"

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
    
    const completeSprint = () => {
        if (sprintData?.data.length && sprintTicketData?.data.length){
            dispatch(setModalType("COMPLETE_SPRINT_FORM"))
            dispatch(setModalProps({
                boardId: boardId,
                sprintId: sprintData.data[0].id,
            }))
            dispatch(toggleShowModal(true))
        }
    }

	const editSprint = () => {
        if (sprintData?.data.length){
            dispatch(setModalType("SPRINT_FORM"))
            dispatch(setModalProps({
                boardId: boardId,
                sprintId: sprintData.data?.[0]?.id ?? 0,
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
                onCheck={onCheck} 
                isLoading={isLoading}
                actionButtons={
                    <div className = "tw-flex tw-flex-row tw-gap-x-2">
                        {
                            sprintData?.data?.[0]?.numCompletedTickets != null && sprintData?.data?.[0]?.numOpenTickets != null ? 
                            <>
                                <div className = "tw-relative tw-group">
                                    <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-secondary tw-text-gray-50">{sprintData?.data?.[0]?.numOpenTickets}</Badge>
                                    <HoverTooltip text={`${sprintData?.data?.[0]?.numOpenTickets} open tickets`}/>
                                </div>
                                <div className = "tw-relative tw-group">
                                    <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-green-500 tw-text-gray-50">{sprintData?.data?.[0]?.numCompletedTickets}</Badge>
                                    <HoverTooltip text={`${sprintData?.data?.[0]?.numCompletedTickets} completed tickets`}/>
                                </div>
                            </> : null
                        }
                        {
                            sprintData?.data.length && sprintTicketData?.data.length ? 
                            <Button theme="primary" onClick={(e) => completeSprint()}>Complete Sprint</Button>
                            : null
                        }
                        <Button onClick={(e) => editSprint()}>Edit Sprint</Button>
                    </div>
                    
                }
                title={
                    <div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                        <span className = "tw-font-medium">{sprintData?.data?.[0]?.name ?? ""}</span>
                        <span className = "tw-text-gray-600">
                            {
                                !sprintData?.data?.[0]?.startDate && !sprintData?.data?.[0]?.endDate ?
                                <Button onClick={(e) => editSprint()}>Add Dates</Button> :
                                <>
                                    {new Date(sprintData.data[0].startDate).toLocaleDateString()} to {new Date(sprintData.data[0].endDate).toLocaleDateString()}
                                </>
                            }
                        </span>
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
