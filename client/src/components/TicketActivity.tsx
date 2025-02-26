import React from "react"
import { ListResponse, TicketActivity as TicketActivityType } from "../types/common"
import { ProfileActivityRow } from "./page-elements/ProfileActivityRow"
import { convertMinutesToTimeDisplay } from "../helpers/functions"
import { TextAreaDisplay } from "./page-elements/TextAreaDisplay"
import { useAppDispatch } from "../hooks/redux-hooks"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../slices/secondaryModalSlice"
import { DeleteTicketActivityWarningProps } from "./secondary-modals/DeleteTicketActivityWarning"

type Props = {
	ticketActivities?: Array<TicketActivityType>
	currentTicketId: number
}

export const TicketActivity = ({currentTicketId, ticketActivities}: Props) => {
	const dispatch = useAppDispatch()
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					ticketActivities?.map((activity: TicketActivityType) => (
						<ProfileActivityRow data={activity} additionalHeaderContent={<span>Logged <span className = "tw-font-bold">{convertMinutesToTimeDisplay(activity.minutesSpent, false, true)}</span></span>} >
							<>
								<TextAreaDisplay rawHTMLString={activity.description}/>
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<button className = "tw-font-bold tw-text-secondary" onClick={() => {
										dispatch(toggleShowSecondaryModal(true))
										dispatch(setSecondaryModalProps({ticketId: currentTicketId ?? undefined, activityId: activity.id}))
										dispatch(setSecondaryModalType("TICKET_ACTIVITY_MODAL"))
									}}>Edit</button>
									<button onClick={() => {
										dispatch(toggleShowSecondaryModal(true))
										dispatch(setSecondaryModalProps<DeleteTicketActivityWarningProps>({ticketId: currentTicketId ?? undefined, activityId: activity.id}))
										dispatch(setSecondaryModalType("DELETE_TICKET_ACTIVITY_WARNING"))
									}} className = "tw-font-bold tw-text-secondary">Delete</button>
								</div>
							</>
						</ProfileActivityRow>
					))
				}
			</div>
	)
}