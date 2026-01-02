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
import { FormValues } from "../../components/boards/BacklogSprintContainer"
import { Badge } from "../page-elements/Badge"
import { Button } from "../page-elements/Button"
import { HoverTooltip } from "../page-elements/HoverTooltip"
import { IconPlus } from "../icons/IconPlus"
import { IconHelp } from "../icons/IconHelp"

interface Props {
    itemIds: Array<number>
    page: number
    setPage: (page: number) => void
    setItemId: (id: number) => void
    sprintData?: Sprint  
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
    const { statuses } = useAppSelector((state) => state.status)

    const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods
    
    const completeSprint = () => {
        if (sprintData && sprintTicketData?.data.length){
            dispatch(setModalType("COMPLETE_SPRINT_FORM"))
            dispatch(setModalProps({
                boardId: boardId,
                sprintId: sprintData.id,
            }))
            dispatch(toggleShowModal(true))
        }
    }

	const editSprint = () => {
        if (sprintData){
            dispatch(setModalType("SPRINT_FORM"))
            dispatch(setModalProps({
                boardId: boardId,
                sprintId: sprintData.id,
            }))
            dispatch(toggleShowModal(true))
        }
	}

    const onCheck = (id: number) => {
        setItemId(id)
    }

    return (
        <BulkEditTicketContainer 
            itemIds={itemIds} 
            onCheck={onCheck} 
            isLoading={isLoading}
            actionButtons={
                <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                    {
                        sprintData?.numCompletedTickets != null && sprintData?.numOpenTickets != null ? 
                        <>
                            <div className = "tw-relative tw-group">
                                <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-secondary tw-text-gray-50">{sprintData?.numOpenTickets}</Badge>
                                <HoverTooltip text={`${sprintData?.numOpenTickets} open tickets`}/>
                            </div>
                            <div className = "tw-relative tw-group">
                                <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-green-500 tw-text-gray-50">{sprintData?.numCompletedTickets}</Badge>
                                <HoverTooltip text={`${sprintData?.numCompletedTickets} completed tickets`}/>
                            </div>
                        </> : null
                    }
                    {
                        sprintData && sprintTicketData?.data.length ? 
                        <Button theme="primary" onClick={(e) => completeSprint()}>Complete Sprint</Button>
                        : null
                    }
                    <Button onClick={(e) => editSprint()}>Edit Sprint</Button>
                </div>
                
            }
            title={
                <div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                    <span className = "tw-font-medium">{sprintData?.name ?? ""}</span>
                    <span className = "tw-text-gray-600">
                        {
                            !sprintData?.startDate && !sprintData?.endDate ?
                            <Button onClick={(e) => editSprint()}>Add Dates</Button> :
                            <>
                                {new Date(sprintData.startDate).toLocaleDateString()} to {new Date(sprintData.endDate).toLocaleDateString()}
                            </>
                        }
                    </span>
                </div>
            } 
            helpText={`This is your current sprint. To add tickets, click on the "Add Ticket" button below, or check off a ticket under the "Backlog" section to
                add it to the current sprint.`}
            totalTickets={sprintTicketData?.pagination?.total ?? 0} 
            tickets={sprintTicketData?.data ?? []}
            createButton={
                <div className = "tw-flex tw-flex-row tw-gap-x-2">
                    <Button onClick={(e) => {
                        dispatch(setModalType("ADD_TICKET_FORM"))
                        dispatch(setModalProps({
                            boardId: boardId,
                            sprintId: sprintData?.id,
                            statusesToDisplay: statuses,
                        }))
                        dispatch(toggleShowModal(true))
                    }}>
                        Add Ticket
                    </Button>
                </div>
            }
            searchBar={
                <div className = "tw-flex tw-flex-col tw-gap-y-2 sm:tw-w-full lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
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
    )
}
