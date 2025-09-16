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
import { IconHelp } from "../icons/IconHelp"
import { HoverTooltip } from "../page-elements/HoverTooltip"

interface Props {
    totalTickets: number
    tickets: Array<Ticket>
    onCheck: (id: number) => void
    itemIds: Array<number>
    helpText: string
    pagination?: React.ReactNode
    title: React.ReactNode 
    isLoading?: boolean
    searchBar?: React.ReactNode
    actionButtons?: React.ReactNode
    createButton?: React.ReactNode
}

export type FormValues = {
	searchBy: string
	query: string	
}

export const BulkEditTicketContainer = ({
    actionButtons,
    itemIds, 
    onCheck, 
    title, 
    totalTickets, 
    tickets, 
    helpText,
    pagination,
    searchBar,
    isLoading,
    createButton,
}: Props) => {
    const [ showTickets, setShowTickets ] = useState(true)

    const dispatch = useAppDispatch()
    return (
        <div className = "tw-p-2 tw-w-full lg:tw-w-[90%] tw-flex tw-flex-col tw-gap-y-2 tw-border tw-bg-gray-100">
            <div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
                <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                    <IconButton onClick={() => setShowTickets(!showTickets)}>
                        {showTickets ? <IconArrowDown/> : <IconArrowRight/>}
                    </IconButton>
                    {title}
                    <span>({totalTickets} items)</span>
                    <div className = "tw-group tw-relative">
                        <IconHelp className = "tw-w-5 tw-h-5"/>
                        <HoverTooltip width={"tw-w-64 lg:tw-w-96"} text={helpText}/>
                    </div>
                    {isLoading ? <LoadingSpinner/>: null}
                    <div></div>
                </div>
                {actionButtons}
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
                        <div key={`bulk-edit-ticket-${ticket.id}`} className = "tw-pl-4 tw-flex tw-flex-row tw-gap-x-2"> 
                            <input id={`bulk-edit-ticket-${ticket.id}-checkmark`} checked={itemIds.includes(ticket.id)} onChange={(e) => onCheck(ticket.id)} type = "checkbox"/>
                            <button className = "tw-w-full" onClick={(e) => {
                                dispatch(toggleShowModal(true))
                                dispatch(setModalType("EDIT_TICKET_FORM"))
                                dispatch(selectCurrentTicketId(ticket.id))
                            }}><TicketRow ticket={ticket} borderless={true}/></button>
                        </div>
                    )}
                </div> : null
            }
            {
                createButton ?? null
            }
        </div>
    )
}
