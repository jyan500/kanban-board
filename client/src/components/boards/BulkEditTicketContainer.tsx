import React, { useState} from "react"
import { TicketRow } from "../TicketRow"
import { useAppSelector } from "../../hooks/redux-hooks"
import { IconArrowDown } from "../icons/IconArrowDown"
import { IconArrowRight } from "../icons/IconArrowRight"
import { Ticket } from "../../types/common"
import { Badge } from "../page-elements/Badge"
import { Button } from "../page-elements/Button"
import { IconButton } from "../page-elements/IconButton"

interface Props {
    title: string
    totalTickets: number
    tickets: Array<Ticket>
    action: () => void
    actionText: string
    pagination?: React.ReactNode
}

export const BulkEditTicketContainer = ({action, actionText, title, totalTickets, tickets, pagination}: Props) => {
    const [ showTickets, setShowTickets ] = useState(true)
    const { statuses } = useAppSelector((state) => state.status)
    const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id)
    const numIncompleteTickets = tickets.filter((ticket) => !completedStatuses.includes(ticket.statusId)).length
    return (
        <div className = "tw-p-2 tw-w-full lg:tw-w-[80%] tw-flex tw-flex-col tw-gap-y-2 tw-bg-gray-100">
            <div className = "tw-p-4 tw-w-full tw-flex tw-flex-row tw-justify-between">
                <div className = "tw-flex tw-items-center tw-flex-row tw-gap-x-2">
                    <input type = "checkbox"/>
                    <IconButton onClick={() => setShowTickets(!showTickets)}>
                        {showTickets ? <IconArrowDown/> : <IconArrowRight/>}
                    </IconButton>
                    <span className = "tw-font-medium">{title}</span>
                    <span>({totalTickets} items)</span>
                </div>

                <div className = "tw-flex tw-flex-row tw-gap-x-2">
                    {/* <Badge className = "tw-bg-gray-300">{numIncompleteTickets}</Badge>
                    <Badge className = "tw-text-white tw-bg-success">{tickets.length - numIncompleteTickets}</Badge> */}
                    <Button onClick={(e) => action()}>{actionText}</Button>
                </div>
            </div>
            {
                pagination ? 
                    <div className = "tw-pr-4 tw-w-full tw-flex tw-flex-row tw-justify-end">
                        {pagination}
                    </div>
                : null
            }
            {
                showTickets ? 
                <div className = "tw-bg-white tw-flex tw-flex-col tw-gap-y-2">
                    {tickets.map((ticket) => 
                        <div className = "tw-pl-4 tw-flex tw-flex-row tw-gap-x-2"> 
                            <input type = "checkbox"/>
                            <TicketRow ticket={ticket} borderless={true}/>
                        </div>
                    )}
                </div> : null
            }
        </div>
    )
}