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
	const [ backlogTicketIds, setBacklogTicketIds ] = useState<Array<number>>([])
	const [ sprintTicketIds, setSprintTicketIds ] = useState<Array<number>>([])
	const [ itemIds, setItemIds ] = useState<Array<number>>([])

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
	const setId = (id: number, items: Array<number>, setter: (items: Array<number>) => void) => {
		if (items.includes(id)){
			setter(items.filter((itemId) => itemId !== id))
		}
		else {
			setter([...items, id])
		}
	}

	const onUpdateSprintTickets = async () => {
		if (sprintData && backlogTicketIds.length){
			const defaultToast = {
				id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `Ticket added to sprint successfully!`,
			} as Toast
			try {
				await updateSprintTickets({sprintId: sprintData?.data?.[0].id ?? 0, ticketIds: backlogTicketIds}).unwrap()
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
				await deleteSprintTickets({sprintId: sprintData?.data?.[0].id, ticketIds: sprintTicketIds}).unwrap()
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
			<BulkEditToolbar itemIds={itemIds} updateIds={(ids: Array<number>) => {
				setItemIds(ids)
				setSprintTicketIds(ids)
				setBacklogTicketIds(ids)
			}}>
				<>
					<button className = "button">Edit Tickets</button>
					{
						backlogTicketIds.length ?
						<LoadingButton text={`Move ${backlogTicketIds.length} ticket(s) to Sprint`} onClick={async (e) => {
							await onUpdateSprintTickets()
						}} className = "button"/>
						: null
					}
					{
						sprintTicketIds.length ? 
						<LoadingButton text={`Remove ${sprintTicketIds.length} ticket(s) from Sprint`} isLoading={isDeleteTicketsLoading} onClick={async (e) => {
							await onDeleteSprintTickets()	
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
					sprintTicketData={sprintTicketData}
					setItemId={(id: number) => {
					setId(id, sprintTicketIds, setSprintTicketIds)
					setId(id, itemIds, setItemIds)
				}} itemIds={sprintTicketIds} boardId={boardInfo?.id ?? 0}/>
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
						boardTicketData={boardTicketData}
						setItemId={(id: number) => {
							setId(id, backlogTicketIds, setBacklogTicketIds)
							setId(id, itemIds, setItemIds)
					}} itemIds={backlogTicketIds} boardId={boardInfo?.id ?? 0}/>
				)
			}
		</div>
    )
}