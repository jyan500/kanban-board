import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm, Controller, FormProvider } from "react-hook-form"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Toast } from "../../types/common"
import InputMask from "react-input-mask"
import { SimpleEditor } from "../page-elements/SimpleEditor"
import { useLazyGetTicketSummaryQuery } from "../../services/private/ticket"
import { addToast } from "../../slices/toastSlice"
import { v4 as uuidv4 } from "uuid"
import { toggleShowSecondaryModal, setSecondaryModalType, setSecondaryModalProps } from "../../slices/secondaryModalSlice"
import { TIME_DISPLAY_FORMAT, TIME_DISPLAY_INPUT_MASK, TIME_DISPLAY_PLACEHOLDER } from "../../helpers/constants"
import { 
	validateTimeFormat, 
	convertMinutesToTimeDisplay, 
	convertTimeDisplayToMinutes 
} from "../../helpers/functions"
import { IconContext } from "react-icons"
import { IconClock } from "../icons/IconClock";
import { LoadingButton } from "../page-elements/LoadingButton"

export type TicketAIFeaturesModalProps = {
	ticketId: number
}

export const TicketAIFeaturesModal = ({ticketId}: TicketAIFeaturesModalProps) => {
	const dispatch = useAppDispatch()
	const [ trigger, { data, isError, isFetching }] = useLazyGetTicketSummaryQuery()
	// const onSubmit = async (values: FormValues) => {
	// }

	const onClick = () => {
		trigger({ticketId: ticketId}, true)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-justify-center">
			<h2>New AI Features</h2>
			<div className = "tw-flex tw-flex-row tw-justify-center tw-gap-x-2">
				<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-p-2 tw-border tw-border-gray-300">
					<h3>Ticket Smart Summary</h3>
					<p>Don't want to read pages of comments to catch up? Try out the Ticket Smart Summary to receive
						a summarized report of the ticket's progress! </p>
					<div>
						<LoadingButton onClick={(e) => onClick()} isLoading={isFetching} className = "button" text="Generate Summary"/>
					</div>
					{data && !isFetching ? (
						<div className = "tw-flex tw-flex-col tw-gap-x-2">
							<p>
								{data.message}	
							</p>
							<small>Generated on {new Date(data.timestamp).toLocaleString()}</small>
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}
