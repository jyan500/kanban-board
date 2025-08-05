import React, {useState} from "react"
import { Link } from "react-router-dom"
import { ListResponse, Ticket, TicketComment, TicketActivity as TicketActivityType } from "../types/common"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { TicketCommentForm } from "./TicketCommentForm"
import { PaginationRow } from "./page-elements/PaginationRow"
import { FilterButton } from "./page-elements/FilterButton"
import { TicketActivity } from "./TicketActivity"
import { IconSparkle } from "./icons/IconSparkle" 
import { setSecondaryModalType, setSecondaryModalProps, toggleShowSecondaryModal } from "../slices/secondaryModalSlice"

type Props = {
	currentTicketId: number
	setCommentPage: (page: number) => void
	ticketComments?: ListResponse<TicketComment>
	commentPage: number
	ticketActivities?: ListResponse<TicketActivityType>
	activityPage: number
	setActivityPage: (page: number) => void
}

export const ActivityContainer = ({
	currentTicketId, 
	setCommentPage, 
	commentPage, 
	ticketComments, 
	ticketActivities, 
	activityPage, 
	setActivityPage
}: Props) => {
	const [isActive, setIsActive] = useState<number>(0)
	const dispatch = useAppDispatch()
	return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-w-full tw-flex tw-flex-row tw-justify-between tw-gap-x-2">
				<p className = "tw-font-semibold">Activity</p>
				<button onClick={() => {
					dispatch(setSecondaryModalType("TICKET_AI_FEATURES_MODAL"))
					dispatch(setSecondaryModalProps({ticketId: currentTicketId ?? ""}))
					dispatch(toggleShowSecondaryModal(true))
				}} className = "tw-flex tw-flex-row tw-gap-x-1 tw-items-center">
					<IconSparkle className = "tw-text-light-purple tw-ml-3 --m-icon"/>
					<small className = "tw-text-light-purple tw-font-semibold">Smart Summary</small>
				</button>
			</div>
			<div className = "tw-p-2 tw-flex tw-flex-row tw-flex-wrap tw-gap-x-6 tw-border-y tw-border-gray-200">
				<FilterButton isActive={isActive === 0} onClick={(e) => {
					setIsActive(0)
				}}>
					Comments	
				</FilterButton>
				<FilterButton isActive={isActive === 1} onClick={(e) => {
					setIsActive(1)
				}}>
					Work Log
				</FilterButton>
			</div>	
			{
				isActive === 0 ? (
					<>
						<div className = "tw-flex tw-flex-row tw-justify-between tw-items-start tw-gap-x-4">
							<TicketCommentForm currentTicketId={currentTicketId} ticketComments={ticketComments?.data?.length ? ticketComments.data : []}/>
							{
								ticketComments?.pagination.nextPage || ticketComments?.pagination.prevPage ? (
									<PaginationRow
										showNumResults={false}
										showPageNums={false}
										setPage={(page: number) => { setCommentPage(page)} }	
										paginationData={ticketComments?.pagination}
										currentPage={commentPage}
									/>
								) : null
							}
						</div>
					</>
				) : (
					<>
						<div className = "tw-flex tw-flex-row tw-justify-between tw-items-start tw-gap-x-4">
							<TicketActivity currentTicketId={currentTicketId} ticketActivities={ticketActivities?.data?.length ? ticketActivities.data : []}/>
							{
								ticketActivities?.pagination.nextPage || ticketActivities?.pagination.prevPage ? (
									<PaginationRow
										showNumResults={false}
										showPageNums={false}
										setPage={(page: number) => { setActivityPage(page)} }	
										paginationData={ticketActivities?.pagination}
										currentPage={activityPage}
									/>
								) : null
							}
						</div>
					</>
				)
			}
		</div>
	)
}
