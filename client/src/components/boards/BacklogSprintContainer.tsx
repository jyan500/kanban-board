import React, {useState, useEffect} from "react"
import { TicketRow } from "../../components/TicketRow"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { BacklogContainer } from "../../components/boards/BacklogContainer"
import { SprintContainer } from "../../components/boards/SprintContainer"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { useUpdateSprintTicketsMutation, useDeleteSprintTicketsMutation } from "../../services/private/sprint"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useLazyGetBoardTicketsQuery } from "../../services/private/board"
import { useGetSprintsQuery, useLazyGetSprintQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"
import { LoadingButton } from "../../components/page-elements/LoadingButton"
import { addToast } from "../../slices/toastSlice"
import { OptionType, Sprint, Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useForm, Controller, FormProvider } from "react-hook-form"
import { useLocation, useParams } from "react-router-dom"
import { AsyncSelect } from "../../components/AsyncSelect"
import { Button } from "../../components/page-elements/Button"

interface BacklogBulkItem {
	id: number
	type: "sprint" | "backlog"
}

interface Props {
	sprint: Sprint | undefined
	isSprintLoading: boolean
	setSprintId?: (sprintId: number) => void
}

export type FormValues = {
	searchBy: string
	query: string	
}

export const BacklogSprintContainer = ({sprint, isSprintLoading}: Props) => {
    const dispatch = useAppDispatch()
    const location = useLocation()
	const sprintDefaultForm: FormValues = {
		query: "",
		searchBy: "title",
	}
	const backlogDefaultForm: FormValues = {
		query: "",
		searchBy: "title",
	}
    const [sprintPreloadedValues, setSprintPreloadedValues] = useState<FormValues>(sprintDefaultForm)
    const [backlogPreloadedValues, setBacklogPreloadedValues] = useState<FormValues>(backlogDefaultForm)
	const sprintMethods = useForm<FormValues>({defaultValues: sprintPreloadedValues})
	const backlogMethods = useForm<FormValues>({defaultValues: backlogPreloadedValues})
	const [ backlogPage, setBacklogPage ] = useState(1)
	const [ sprintPage, setSprintPage ] = useState(1)
	const { board, boardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)	
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const nonCompletedStatuses = statuses.filter((status) => !status.isCompleted).map((status) => status.id) ?? []
	const [ deleteSprintTickets, { isLoading: isDeleteTicketsLoading }] = useDeleteSprintTicketsMutation()
	const [ updateSprintTickets, { isLoading: isUpdateTicketsLoading }] = useUpdateSprintTicketsMutation()
    const [trigger, { data: sprintTicketData, isFetching: isSprintTicketFetching, isLoading: isSprintTicketLoading, isError: isSprintTicketError }] = useLazyGetSprintTicketsQuery()
	const [triggerGetBoardTicketData, { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError }] = useLazyGetBoardTicketsQuery()
	const [ itemIds, setItemIds ] = useState<Array<BacklogBulkItem>>([])

	const backlogTickets = itemIds.filter((obj) => obj.type === "backlog")
	const sprintTickets = itemIds.filter((obj) => obj.type === "sprint")

	useEffect(() => {
		// if we're coming from the past sprints page to create a sprint, pop up the create sprints modal
		if (location.state?.createSprint === true){
			dispatch(setModalType("SPRINT_FORM"))
			dispatch(setModalProps({
				boardId: boardInfo?.id ?? 0
			}))
			dispatch(toggleShowModal(true))
		}
	}, [location.state])

    useEffect(() => {
        if (sprint && !isSprintLoading && boardInfo){
            // get the tickets for the most recent sprint
            trigger({sprintId: sprint.id, urlParams: {page: 1, includeAssignees: true}})
			triggerGetBoardTicketData({id: boardInfo.id, urlParams: {
				page: 1,
				"includeTicketStats": true,
				"includeAssignees": true, 
				"includeRelationshipInfo": true, 
				"statusIds": nonCompletedStatuses,
				"excludeSprintId": sprint.id,
				"limit": true,
			}})
        }
    }, [sprint, isSprintLoading, boardInfo])

	useEffect(() => {
        if (sprint && !isSprintLoading){
			trigger({
				sprintId: sprint.id, urlParams: {
					...sprintPreloadedValues,
					page: sprintPage,
					includeAssignees: true}
			}, true
			)
		}
	}, [sprint, isSprintLoading, sprintPreloadedValues, sprintPage])

	useEffect(() => {
		if (boardInfo && sprint && !isSprintLoading){
			triggerGetBoardTicketData({id: boardInfo.id, urlParams: {
				...backlogPreloadedValues,
				page: backlogPage,
				"includeTicketStats": true,
				"includeAssignees": true, 
				"includeRelationshipInfo": true, 
				"statusIds": nonCompletedStatuses,
				"excludeSprintId": sprint.id,
				"limit": true,
			}}, true)
		}
	}, [isSprintLoading, sprint, boardInfo, backlogPreloadedValues, backlogPage])
	// in order for ease of use with the existing bulk edit toolbar, track a "combined" array of both 
	// selected backlog and sprint tickets
	const setId = (id: number, type: "sprint" | "backlog", items: Array<BacklogBulkItem>, setter: (items: Array<BacklogBulkItem>) => void) => {
		if (items.find((obj) => obj.id === id) != null){
			setter(items.filter((obj) => obj.id !== id))
		}
		else {
			setter([...items, {id, type}])
		}
	}

	const onSearchSprint = (values: FormValues, page=1) => {
        if (sprint){
			setSprintPreloadedValues(values)
			// re-trigger a query when re-setting the page value with the
			// updated search params
			setSprintPage(1)
		}
	}

	const onSearchBacklog = (values: FormValues, page=1) => {
		// re-trigger a query when re-setting the page value
		// updated search params
        if (sprint){
			setBacklogPreloadedValues(values)
			setBacklogPage(1)
		}
	}

	const onUpdateSprintTickets = async () => {
		if (sprint && itemIds.length){
			const defaultToast = {
				id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added to sprint successfully!`,
			} as Toast
			try {
				await updateSprintTickets({sprintId: sprint.id ?? 0, ticketIds: backlogTickets.map((obj) => obj.id)}).unwrap()
				dispatch(addToast(defaultToast))
			}
			catch {
				dispatch(addToast({
					...defaultToast,
					type: "failure",
					message: "There was an error when adding tickets to the sprint"
				}))
			}
		}
	}

	const onDeleteSprintTickets = async () => {
		if (sprint){
			const defaultToast = {
				id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added to sprint successfully!`,
			} as Toast
			try {
				await deleteSprintTickets({sprintId: sprint.id, ticketIds: sprintTickets.map((obj) => obj.id)}).unwrap()
				dispatch(addToast(defaultToast))
			}
			catch {
				dispatch(addToast({
					...defaultToast,
					type: "failure",
					message: "There was an error when removing tickets from sprint"
				}))
			}
		}
	}

    return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-4">
			<BulkEditToolbar itemIds={itemIds.map((obj) => obj.id)} updateIds={(ids: Array<number>) => {
				setItemIds([])
			}}>
				<>
					<Button theme="secondary" onClick={(e) => {
						const allSprintTickets = sprintTicketData?.data ? sprintTicketData?.data.map((sprintTicket) => {
							return {
								id: sprintTicket.id,
								type: "sprint"
							} as BacklogBulkItem
						}) : []
						const allBacklogTickets = boardTicketData?.data ? boardTicketData?.data.map((boardTicket) => {
							return {
								id: boardTicket.id,
								type: "backlog"
							} as BacklogBulkItem
						}) : []
						setItemIds([...allSprintTickets, ...allBacklogTickets])
					}} >Select All</Button>
					<Button theme="primary" onClick={(e) => {
						if (boardInfo){
							dispatch(setModalType("BULK_ACTIONS_MODAL"))
							dispatch(setModalProps({
								boardId: boardInfo.id,
								initSelectedIds: itemIds,
								// default to step 2 since we've selected ids to edit
								initStep: 2
							}))
							dispatch(toggleShowModal(true))
						}
					}} >Edit Tickets</Button>
					{
						backlogTickets.length && sprint && !sprint.isCompleted ?
						<LoadingButton isLoading={isUpdateTicketsLoading} text={`Move ${backlogTickets.length} ticket(s) to Sprint`} onClick={async (e) => {
							await onUpdateSprintTickets()
							// filter out the selected backlog tickets
							setItemIds(itemIds.filter((obj) => obj.type !== "backlog"))
							// if the current pagination page no longer has any items due to being removed, 
							// go back to the previous page
							// this will re-trigger a query to grab the previous page of results
							if (boardTicketData?.pagination.prevPage){
								setBacklogPage(boardTicketData?.pagination.prevPage)
							}
						}} />
						: null
					}
					{
						sprintTickets.length && !sprint?.isCompleted ? 
						<LoadingButton isLoading={isDeleteTicketsLoading} text={`Remove ${sprintTickets.length} ticket(s) from Sprint`} onClick={async (e) => {
							await onDeleteSprintTickets()	
							// filter out the selected sprint tickets
							setItemIds(itemIds.filter((obj) => obj.type !== "sprint"))
							// if the current pagination page no longer has any items due to being removed, 
							// go back to the previous page
							// this will re-trigger a query to grab the previous page of results
							if (sprintTicketData?.data.length === 0 && sprintTicketData?.pagination.prevPage){
								setSprintPage(sprintTicketData?.pagination.prevPage)
							}
						}} />
						: null
					}
				</>
			</BulkEditToolbar>
			{
				(isSprintLoading || !boardInfo) ? (
					<LoadingSkeleton>
						<RowPlaceholder numRows={4}/>
					</LoadingSkeleton>
				) : (
				<FormProvider {...sprintMethods}>
					<SprintContainer 
						page={sprintPage}
						setPage={setSprintPage}
						onSubmit={onSearchSprint}
						sprintData={sprint}
						isLoading={isUpdateTicketsLoading}
						sprintTicketData={sprintTicketData}
						setItemId={(id: number) => {
							setId(id, "sprint", itemIds, setItemIds)
					}} itemIds={sprintTickets.map((obj) => obj.id)} boardId={boardInfo?.id ?? 0}/>
				</FormProvider>
				)
			}
			{
				(isBoardTicketLoading || !boardInfo) ? (
					<LoadingSkeleton>
						<RowPlaceholder numRows={4}/>
					</LoadingSkeleton>
				) : (
					<FormProvider {...backlogMethods}>
						<BacklogContainer 
							page={backlogPage}
							setPage={setBacklogPage}
							onSubmit={onSearchBacklog}
							isLoading={isDeleteTicketsLoading}
							boardTicketData={boardTicketData}
							setItemId={(id: number) => {
								setId(id, "backlog", itemIds, setItemIds)
						}} itemIds={backlogTickets.map((obj) => obj.id)} boardId={boardInfo?.id ?? 0}/>
					</FormProvider>
				)
			}
		</div>
    )
}
