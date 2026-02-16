import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { EditTicketForm } from "../EditTicketForm"
import { useGetTicketQuery } from "../../services/private/ticket"
import { Ticket } from "../../types/common"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { TicketFormPlaceholder } from "../placeholders/TicketFormPlaceholder"
import { skipToken } from "@reduxjs/toolkit/query"
import { Banner } from "../page-elements/Banner"

export const EditTicketFormModal = () => {
	const {
		tickets,
		currentTicketId,
		statusesToDisplay,
		boardInfo,
	} = useAppSelector((state) => state.board)

	const {data, isLoading, isError} = useGetTicketQuery(currentTicketId ?? skipToken)
	/* Add warning message saying that you created a ticket that was just filtered out */
	if (!isLoading && isError){
		<Banner type={"failure"} message={"Something went wrong!"}>
		</Banner>
	}
	return (
		!isLoading && data ? 
			<>
				{
					!tickets.find((ticket) => ticket.id === currentTicketId) ? 
					<div className="tw-w-full tw-flex tw-flex-row tw-justify-start tw-mb-2">
						<Banner type={"warning"} message={"This ticket is being filtered out and not visible on the board."}>
						</Banner>
					</div> : null
				}
				<EditTicketForm boardId={boardInfo?.id} isModal={true} ticket={data[0]} statusesToDisplay={statusesToDisplay}/>
			</>
		:
		<LoadingSkeleton width={"tw-w-full"} height={"tw-h-[600px]"}>
			<TicketFormPlaceholder/>
		</LoadingSkeleton>
	)	
}
