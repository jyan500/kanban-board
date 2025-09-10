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
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { SearchToolBar } from "../tickets/SearchToolBar"
import { FormValues } from "../../pages/boards/BoardBacklog"

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

	const methods = useFormContext<FormValues>()
    const { handleSubmit } = methods

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
                searchBar={
                    <div className = "tw-flex tw-flex-row tw-justify-between">
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
