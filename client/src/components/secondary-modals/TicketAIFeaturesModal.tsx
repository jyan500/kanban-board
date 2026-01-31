import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useLazyGetTicketSummaryQuery, ticketApi } from "../../services/private/ticket"
import { LoadingButton } from "../page-elements/LoadingButton"
import { IconDocumentReport } from "../icons/IconDocumentReport"
import { BackendErrorMessage } from "../page-elements/BackendErrorMessage"
import { STANDARD_BORDER, PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"

export type TicketAIFeaturesModalProps = {
	ticketId: number
	loadSmartSummary?: boolean
}

export const TicketAIFeaturesModal = ({ticketId, loadSmartSummary}: TicketAIFeaturesModalProps) => {
	const dispatch = useAppDispatch()
	const [ trigger, { data, error, isFetching }] = useLazyGetTicketSummaryQuery()
	const cachedResult = useAppSelector((state) => {
        return ticketApi.endpoints.getTicketSummary.select({ticketId: ticketId})(state)
    })

	useEffect(() => {
		if (loadSmartSummary){
			trigger({ticketId: ticketId}, true)
		}
	}, [loadSmartSummary])

	const onClick = () => {
		trigger({ticketId: ticketId}, true)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-justify-center">
			<h2 className ={PRIMARY_TEXT} >New AI Features</h2>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-gap-x-2">
				<div className = {`tw-flex tw-flex-col tw-gap-y-2 tw-p-2 tw-border tw-border-gray-300 ${STANDARD_BORDER}`}>
					<div className = "tw-flex tw-items-start tw-flex-row tw-gap-x-1">
						<IconDocumentReport className = {`${PRIMARY_TEXT} tw-w-6 tw-h-6`}/>
						<p className = {`${PRIMARY_TEXT} tw-font-bold tw-text-lg`}>Ticket Smart Summary</p>
					</div>
					<p className = {`${SECONDARY_TEXT} tw-medium tw-tracking-light`}>Don't want to read pages of comments to catch up? Try out the Ticket Smart Summary to receive
						a summarized report of the ticket's progress! </p>
					<div>
						<LoadingButton disabled={isFetching} onClick={(e) => onClick()} isLoading={isFetching} className = "button" text="Generate Summary"/>
					</div>
					{cachedResult?.data ? 
					<div className = "tw-flex tw-flex-col tw-gap-x-2">
						<p className = {`tw-text-sm tw-font-mono dark:tw-text-gray-300 tw-text-gray-700`}>{cachedResult.data?.message}</p>
						<small className={SECONDARY_TEXT}>Generated on {cachedResult.data?.timestamp ? new Date(cachedResult.data.timestamp).toLocaleString() : ""}</small>
					</div> : null}
					<BackendErrorMessage error={error}/>
				</div>
			</div>
		</div>
	)
}
