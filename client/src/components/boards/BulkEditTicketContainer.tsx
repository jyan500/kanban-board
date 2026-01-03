import React, { useState} from "react"
import { TicketRow } from "../TicketRow"
import { IconArrowDown } from "../icons/IconArrowDown"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { IconArrowRight } from "../icons/IconArrowRight"
import { Ticket } from "../../types/common"
import { IconButton } from "../page-elements/IconButton"
import { LoadingSpinner } from "../LoadingSpinner"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { toggleShowModal, setModalType } from "../../slices/modalSlice"
import { selectCurrentTicketId } from "../../slices/boardSlice"
import { IconHelp } from "../icons/IconHelp"
import { HoverTooltip } from "../page-elements/HoverTooltip"
import { useScreenSize } from "../../hooks/useScreenSize"
import { LG_BREAKPOINT } from "../../helpers/constants"
import { IconCircleCheckmark } from "../icons/IconCircleCheckmark"

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
    isSprintComplete?: boolean
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
    isSprintComplete,
    isLoading,
    createButton,
}: Props) => {
    const [ showTickets, setShowTickets ] = useState(true)
    const dispatch = useAppDispatch()
    const { width, height } = useScreenSize()
    return (
        <div className = "tw-p-2 tw-w-full tw-flex tw-flex-col tw-gap-y-2 tw-border tw-bg-gray-100">
            <div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
                {
                    width >= LG_BREAKPOINT ? (
                        <>
                            <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                                <IconButton onClick={() => setShowTickets(!showTickets)}>
                                    {showTickets ? <IconArrowDown/> : <IconArrowRight/>}
                                </IconButton>
                                {title}
                                <span>({totalTickets} items)</span>
                                <div className = "tw-group tw-relative">
                                    {!isSprintComplete ? <IconHelp className = "tw-w-5 tw-h-5"/> : <IconCircleCheckmark className="tw-text-green-500 tw-w-5 tw-h-5"/>}
                                    <HoverTooltip direction={"top"} width={!isSprintComplete ? "tw-w-64 lg:tw-w-96" : "tw-w-32 lg:tw-w-48"} text={helpText}/>
                                </div>
                                {isLoading ? <LoadingSpinner/>: null}
                            </div>
                            {actionButtons}
                        </>
                    ) : (
                        <>
                            <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                                <IconButton onClick={() => setShowTickets(!showTickets)}>
                                    {showTickets ? <IconArrowDown/> : <IconArrowRight/>}
                                </IconButton>
                                {title}
                            </div>
                            <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                                <span>({totalTickets} items)</span>
                                <div className = "tw-group tw-relative">
                                    <IconHelp className = "tw-w-5 tw-h-5"/>
                                    <HoverTooltip direction={"right"} width={"tw-w-64 lg:tw-w-96"} text={helpText}/>
                                </div>
                                {isLoading ? <LoadingSpinner/>: null}
                            </div>
                            {actionButtons}
                        </>
                    )
                }

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
                            {!isSprintComplete ? <input id={`bulk-edit-ticket-${ticket.id}-checkmark`} checked={itemIds.includes(ticket.id)} onChange={(e) => onCheck(ticket.id)} type = "checkbox"/> : null}
                            <button className = "tw-w-full" onClick={(e) => {
                                dispatch(toggleShowModal(true))
                                dispatch(setModalType("EDIT_TICKET_FORM"))
                                dispatch(selectCurrentTicketId(ticket.id))
                            }}><TicketRow ticket={ticket} borderless={true}/></button>
                        </div>
                    )}
                </div> : <LoadingSkeleton><RowPlaceholder/></LoadingSkeleton> 
            }
            {
                createButton ?? null
            }
        </div>
    )
}
