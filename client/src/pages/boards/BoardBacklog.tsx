import React, {useState, useEffect} from "react"
import { TicketRow } from "../../components/TicketRow"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { BacklogContainer } from "../../components/boards/BacklogContainer"
import { SprintContainer } from "../../components/boards/SprintContainer"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { useUpdateSprintTicketsMutation, useDeleteSprintTicketsMutation } from "../../services/private/sprint"
import { BoardScheduleFilters } from "../../slices/boardScheduleSlice"
import { toggleShowModal, setModalType, setModalProps } from "../../slices/modalSlice"
import { useLazyGetBoardTicketsQuery } from "../../services/private/board"
import { useGetSprintsQuery, useLazyGetSprintTicketsQuery } from "../../services/private/sprint"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"
import { LoadingButton } from "../../components/page-elements/LoadingButton"
import { addToast } from "../../slices/toastSlice"
import { Toast } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { useForm, FormProvider } from "react-hook-form"

interface BacklogBulkItem {
	id: number
	type: "sprint" | "backlog"
}

export type FormValues = {
	searchBy: string
	query: string	
}

export const BoardBacklog = () => {
    const dispatch = useAppDispatch()
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
	const boardId = boardInfo?.id ?? 0
	const { ticketTypes } = useAppSelector((state) => state.ticketType)
	const { statuses } = useAppSelector((state) => state.status)
	const { priorities } = useAppSelector((state) => state.priority)
	const completedStatuses = statuses.filter((status) => status.isCompleted).map((status) => status.id) ?? []
	const [ deleteSprintTickets, { isLoading: isDeleteTicketsLoading }] = useDeleteSprintTicketsMutation()
	const [ updateSprintTickets, { isLoading: isUpdateTicketsLoading }] = useUpdateSprintTicketsMutation()
	const { data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading} = useGetSprintsQuery(boardId !== 0 ? {urlParams: {
        boardId: boardId,
		filterInProgress: true,
        recent: true,
    }} : skipToken)
    const [trigger, { data: sprintTicketData, isFetching: isSprintTicketFetching, isLoading: isSprintTicketLoading, isError: isSprintTicketError }] = useLazyGetSprintTicketsQuery()
	const [triggerGetBoardTicketData, { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError }] = useLazyGetBoardTicketsQuery()
	const [ itemIds, setItemIds ] = useState<Array<BacklogBulkItem>>([])

	const backlogTickets = itemIds.filter((obj) => obj.type === "backlog")
	const sprintTickets = itemIds.filter((obj) => obj.type === "sprint")

    useEffect(() => {
        if (sprintData && !isSprintLoading && sprintData.data.length && boardId !== 0){
            // get the tickets for the most recent sprint
            trigger({sprintId: sprintData.data[0].id, urlParams: {page: 1, includeAssignees: true}})
			triggerGetBoardTicketData({id: boardId, urlParams: {
				page: 1,
				"includeAssignees": true, 
				"includeRelationshipInfo": true, 
				"excludeSprintId": sprintData?.data?.[0]?.id,
				"limit": true,
			}})
        }
    }, [sprintData, isSprintLoading, boardId])

	useEffect(() => {
        if (sprintData && !isSprintLoading && sprintData.data.length){
			trigger({
				sprintId: sprintData.data[0].id, urlParams: {
					...sprintPreloadedValues,
					page: sprintPage,
					includeAssignees: true}
			}, true
			)
		}
	}, [sprintPreloadedValues, sprintPage])

	useEffect(() => {
		triggerGetBoardTicketData({id: boardId, urlParams: {
			...backlogPreloadedValues,
			page: backlogPage,
			"includeAssignees": true, 
			"includeRelationshipInfo": true, 
			"excludeSprintId": sprintData?.data?.[0]?.id,
			"limit": true,
		}}, true)
	}, [backlogPreloadedValues, backlogPage])
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
        if (sprintData && !isSprintLoading && sprintData.data.length){
			setSprintPreloadedValues(values)
			// re-trigger a query when re-setting the page value with the
			// updated search params
			setSprintPage(1)
		}
	}

	const onSearchBacklog = (values: FormValues, page=1) => {
		// re-trigger a query when re-setting the page value
		// updated search params
        if (sprintData && !isSprintLoading && sprintData.data.length){
			setBacklogPreloadedValues(values)
			setBacklogPage(1)
		}
	}

	const onUpdateSprintTickets = async () => {
		if (sprintData && itemIds.length){
			const defaultToast = {
				id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added to sprint successfully!`,
			} as Toast
			try {
				await updateSprintTickets({sprintId: sprintData?.data?.[0].id ?? 0, ticketIds: backlogTickets.map((obj) => obj.id)}).unwrap()
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
		if (sprintData){
			const defaultToast = {
				id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added to sprint successfully!`,
			} as Toast
			try {
				await deleteSprintTickets({sprintId: sprintData?.data?.[0].id, ticketIds: sprintTickets.map((obj) => obj.id)}).unwrap()
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
					<button onClick={(e) => {
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
					}} className = "button --secondary">Select All</button>
					<button onClick={(e) => {
						dispatch(setModalType("BULK_ACTIONS_MODAL"))
						dispatch(setModalProps({
							boardId: boardInfo?.id ?? 0,
							initSelectedIds: itemIds,
							// default to step 2 since we've selected ids to edit
							initStep: 2
						}))
						dispatch(toggleShowModal(true))
					}} className = "button">Edit Tickets</button>
					{
						backlogTickets.length ?
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
						}} className = "button"/>
						: null
					}
					{
						sprintTickets.length ? 
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
						}} className = "button"/>
						: null
					}
				</>
			</BulkEditToolbar>
			{
				!sprintTicketData && !sprintData ? (
					<LoadingSkeleton>
						<RowPlaceholder/>
					</LoadingSkeleton>
				) : (
				<FormProvider {...sprintMethods}>
					<SprintContainer 
						page={sprintPage}
						setPage={setSprintPage}
						onSubmit={onSearchSprint}
						sprintData={sprintData}
						isLoading={isUpdateTicketsLoading}
						sprintTicketData={sprintTicketData}
						setItemId={(id: number) => {
							setId(id, "sprint", itemIds, setItemIds)
					}} itemIds={sprintTickets.map((obj) => obj.id)} boardId={boardInfo?.id ?? 0}/>
				</FormProvider>
			)
			}
			{
				 !boardTicketData ? (
					<LoadingSkeleton>
						<RowPlaceholder/>
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
