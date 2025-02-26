import React from "react"
import { ListResponse, TicketActivity as TicketActivityType } from "../types/common"
import { ProfileActivityRow } from "./page-elements/ProfileActivityRow"
import { convertMinutesToTimeDisplay } from "../helpers/functions"

type Props = {
	ticketActivities?: Array<TicketActivityType>
	currentTicketId: number
}

export const TicketActivity = ({currentTicketId, ticketActivities}: Props) => {
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2">
				{
					ticketActivities?.map((activity: TicketActivityType) => (
						<ProfileActivityRow data={activity} additional={`Logged ${convertMinutesToTimeDisplay(activity.minutesSpent)}`} >
							<div>Test</div>
						</ProfileActivityRow>
					))
				}
			</div>
	)
}