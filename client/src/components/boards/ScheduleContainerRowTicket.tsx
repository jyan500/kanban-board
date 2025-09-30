import React from "react"
import { Ticket, TicketType } from "../../types/common"
import { TICKET_TYPE_COLOR_MAP } from "../../helpers/constants"

interface Props {
    ticket: Ticket
    position: {left: string, width: string}
    ticketType: string 
}

export const ScheduleContainerRowTicket = ({ticket, position, ticketType}: Props) => {
    return (
        <div key={`bar-${ticket.id}`} className="tw-relative tw-h-16 tw-flex tw-items-center hover:tw-bg-gray-50 tw-transition-colors">
            {/* Invisible column structure to maintain width. (Not sure if this is actually necessary so keeping as a comment) */}
            {/* <div className="tw-flex tw-flex-row tw-w-full">
                {timeColumns.map((date, index) => (
                    <div
                        key={index}
                        className="tw-flex-1 tw-min-w-[60px]"
                    />
                ))}
            </div> */}
            {/* Absolutely positioned task bar */}
            <div
                className="tw-absolute tw-h-6 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-medium tw-shadow-sm"
                style={{
                    left: position.left,
                    width: position.width,
                    backgroundColor: TICKET_TYPE_COLOR_MAP[ticketType as keyof typeof TICKET_TYPE_COLOR_MAP] || '#3B82F6',
                    minWidth: '2px'
                }}
            >
                {parseFloat(position.width) > 10 && (
                    <span className="tw-truncate tw-px-2">{ticket.name}</span>
                )}
            </div>
        </div>
    )
}