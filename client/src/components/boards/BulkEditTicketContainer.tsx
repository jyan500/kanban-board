import React, { useState} from "react"
import { TicketRow } from "../TicketRow"
import { IconArrowDown } from "../icons/IconArrowDown"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { IconArrowRight } from "../icons/IconArrowRight"
import { Ticket } from "../../types/common"
import { Badge } from "../page-elements/Badge"
import { Button } from "../page-elements/Button"
import { IconButton } from "../page-elements/IconButton"
import { LoadingSpinner } from "../LoadingSpinner"
import { toggleShowModal, setModalType } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { useForm, FormProvider } from "react-hook-form"
import { SearchToolBar } from "../tickets/SearchToolBar"

interface Props {
    totalTickets: number
    tickets: Array<Ticket>
    onCheck: (id: number) => void
    action: () => void
    actionText: string
    itemIds: Array<number>
    pagination?: React.ReactNode
    title: React.ReactNode 
    isLoading?: boolean
    searchBar?: React.ReactNode
}

export type FormValues = {
	searchBy: string
	query: string	
}

export const BulkEditTicketContainer = ({
    action, 
    actionText, 
    itemIds, 
    onCheck, 
    title, 
    totalTickets, 
    tickets, 
    pagination,
    searchBar,
    isLoading
}: Props) => {
    const [ showTickets, setShowTickets ] = useState(true)

    const dispatch = useAppDispatch()
    return (
        <div className = "lg:tw-p-2 tw-p-0.5 tw-w-full lg:tw-w-[80%] tw-flex tw-flex-col tw-gap-y-2 tw-border tw-bg-gray-100">
            <div className = "tw-w-full tw-flex tw-flex-row tw-justify-between">
                <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                    <IconButton onClick={() => setShowTickets(!showTickets)}>
                        {showTickets ? <IconArrowDown/> : <IconArrowRight/>}
                    </IconButton>
                    {title}
                    <span>({totalTickets} items)</span>
                    {isLoading ? <LoadingSpinner/>: null}
                </div>

                <div className = "tw-flex tw-flex-row tw-gap-x-2">
                    <Button onClick={(e) => action()}>{actionText}</Button>
                </div>
            </div>
            {
                searchBar ? searchBar : null
            }
            {
                pagination ? 
                    pagination
                : null
            }
            {
                showTickets ? 
                <div className = {`${tickets.length ? "tw-border" : ""} tw-bg-white tw-flex tw-flex-col tw-gap-y-2`}>
                    {tickets.map((ticket) => 
                        <div className = "tw-pl-4 tw-flex tw-flex-row tw-gap-x-2"> 
                            <input checked={itemIds.includes(ticket.id)} onChange={(e) => onCheck(ticket.id)} type = "checkbox"/>
                            <button className = "tw-w-full" onClick={(e) => {
                                dispatch(toggleShowModal(true))
                                dispatch(setModalType("EDIT_TICKET_FORM"))
                                dispatch(selectCurrentTicketId(ticket.id))
                            }}><TicketRow ticket={ticket} borderless={true}/></button>
                        </div>
                    )}
                </div> : null
            }
        </div>
    )
}