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

interface BacklogBulkItem {
	id: number
	type: "sprint" | "backlog"
}

export const BoardBacklog = () => {
    const dispatch = useAppDispatch()
	const { filters, filterButtonState } = useAppSelector((state) => state.boardSchedule)
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
	const { data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading} = useGetSprintsQuery({urlParams: {
        boardId: boardId,
        recent: true
    }})
    const [trigger, { data: sprintTicketData, isFetching: isSprintTicketFetching, isLoading: isSprintTicketLoading, isError: isSprintTicketError }] = useLazyGetSprintTicketsQuery()
	const [triggerGetBoardTicketData, { data: boardTicketData, isFetching: isBoardTicketFetching, isLoading: isBoardTicketLoading, isError: isBoardTicketError }] = useLazyGetBoardTicketsQuery()
	const [ itemIds, setItemIds ] = useState<Array<BacklogBulkItem>>([])

	const backlogTickets = itemIds.filter((obj) => obj.type === "backlog")
	const sprintTickets = itemIds.filter((obj) => obj.type === "sprint")

    useEffect(() => {
        if (sprintData && !isSprintLoading){
            // get the tickets for the most recent sprint
            trigger({sprintId: sprintData?.data?.[0]?.id ?? 0, urlParams: {page: sprintPage, includeAssignees: true}})
			triggerGetBoardTicketData({id: boardId, urlParams: {
				backlogPage,
				"includeAssignees": true, 
				"includeRelationshipInfo": true, 
				"excludeSprintId": sprintData?.data?.[0]?.id,
				"limit": true,
			}})
        }
    }, [sprintData, isSprintLoading])

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
						}} className = "button"/>
						: null
					}
					{
						sprintTickets.length ? 
						<LoadingButton isLoading={isDeleteTicketsLoading} text={`Remove ${sprintTickets.length} ticket(s) from Sprint`} onClick={async (e) => {
							await onDeleteSprintTickets()	
							// filter out the selected sprint tickets
							setItemIds(itemIds.filter((obj) => obj.type !== "sprint"))
						}} className = "button"/>
						: null
					}
				</>
			</BulkEditToolbar>
			{
				isSprintTicketLoading && isSprintLoading && !sprintTicketData && !sprintData ? (
					<LoadingSkeleton>
						<RowPlaceholder/>
					</LoadingSkeleton>
				) : (
				<SprintContainer 
					sprintData={sprintData}
					isLoading={isUpdateTicketsLoading}
					sprintTicketData={sprintTicketData}
					setItemId={(id: number) => {
						setId(id, "sprint", itemIds, setItemIds)
				}} itemIds={sprintTickets.map((obj) => obj.id)} boardId={boardInfo?.id ?? 0}/>
			)
			}
			{
				 isBoardTicketLoading && !boardTicketData ? (
					<LoadingSkeleton>
						<RowPlaceholder/>
					</LoadingSkeleton>
				) : (
					<BacklogContainer 
						page={backlogPage}
						setPage={setBacklogPage}
						isLoading={isDeleteTicketsLoading}
						boardTicketData={boardTicketData}
						setItemId={(id: number) => {
							setId(id, "backlog", itemIds, setItemIds)
					}} itemIds={backlogTickets.map((obj) => obj.id)} boardId={boardInfo?.id ?? 0}/>
				)
			}
		</div>
    )
}