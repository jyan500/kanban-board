import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { setModalType, setModalProps, toggleShowModal } from "../../slices/modalSlice"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetBoardTicketsQuery } from "../../services/private/board"
import { BulkEditTicketContainer } from "./BulkEditTicketContainer"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { PaginationRow } from "../page-elements/PaginationRow"
import { useNavigate } from "react-router-dom"
import { ListResponse, Ticket } from "../../types/common"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { FormValues } from "../../pages/boards/BoardBacklog"
import { Button } from "../page-elements/Button"
import { Badge } from "../page-elements/Badge"
import { HoverTooltip } from "../page-elements/HoverTooltip"
import { BOARDS, SPRINTS } from "../../helpers/routes"
import { IconPlus } from "../icons/IconPlus"

interface Props {
    itemIds: Array<number>
    page: number
    setPage: (page: number) => void
    boardTicketData?: ListResponse<Ticket>
    setItemId: (id: number) => void
    onSubmit: (values: FormValues) => void
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
    onSubmit,
    isLoading
}: Props) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
	const { statuses } = useAppSelector((state) => state.status)

	const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods

    const boardPath = `${BOARDS}/${boardId}`

	const registerOptions = {
	}

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
                actionButtons={
                    <div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                         {
                            boardTicketData?.additional != null ? 
                            <>
                                <div className = "tw-relative tw-group">
                                    <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-secondary tw-text-gray-50">{boardTicketData.additional.numOpenTickets}</Badge>
                                    <HoverTooltip text={`${boardTicketData.additional.numOpenTickets} open tickets`}/>
                                </div>
                                <div className = "tw-relative tw-group">
                                    <Badge className = "tw-flex tw-justify-center tw-items-center tw-w-8 tw-h-8 tw-bg-green-500 tw-text-gray-50">{boardTicketData.additional.numCompletedTickets}</Badge>
                                    <HoverTooltip text={`${boardTicketData.additional.numCompletedTickets} completed tickets`}/>
                                </div>
                            </> : null
                        }
                        <Button onClick={(e) => createSprint()}>Create Sprint</Button>
                    </div>
                    
                }
                title={
                    <span className = "tw-font-medium">Backlog</span>
                } 
                helpText={`This backlog contains all open tickets. Click on the "Add Ticket" button below to add a ticket, or check off a ticket under the "Backlog" section to
                    add it to the current sprint.`}
                totalTickets={boardTicketData?.pagination.total ?? 0} 
                onCheck={onCheck}
                isLoading={isLoading}
                itemIds={itemIds}
                tickets={boardTicketData?.data ?? []}
                createButton={
                    <div className = "tw-flex tw-flex-row tw-gap-x-2">
                        <Button onClick={(e) => {
                            dispatch(setModalType("ADD_TICKET_FORM"))
                            dispatch(setModalProps({
                                boardId: boardId,
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
                                paginationData={boardTicketData?.pagination} 
                                setPage={setPage} 
                                currentPage={page ?? 1}
                                registerOptions={registerOptions}
                                searchOptions = {{"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}}
                                onFormSubmit={async () => {
                                    await handleSubmit(onSubmit)()
                                }}
                                hidePagination={true}
                            >
                            </SearchToolBar>
                        </FormProvider>
                        <>
                        {
                            boardTicketData?.pagination.nextPage || boardTicketData?.pagination.prevPage ? (
                                <div className="">
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
                    </div>
                }
            />
        </div>
    )
}
