import React, {useState, useEffect, useRef, useMemo} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { SearchBar } from "../SearchBar" 
import "../../styles/toolbar.css"
import { setBoard, setFilteredTickets, setGroupBy } from "../../slices/boardSlice" 
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice" 
import { prioritySort as sortByPriority } from "../../helpers/functions"
import { useForm, FormProvider } from "react-hook-form"
import { useDebouncedValue } from "../../hooks/useDebouncedValue" 
import { OverlappingRow } from "../OverlappingRow" 
import { Board, GroupByOptionsKey } from "../../types/common"
import { useGetUserProfilesQuery } from "../../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useScreenSize } from "../../hooks/useScreenSize"
import { useClickOutside } from "../../hooks/useClickOutside" 
import { MD_BREAKPOINT, GROUP_BY_OPTIONS } from "../../helpers/constants"
import { setSearchTerm } from "../../slices/boardFilterSlice"
import { IconButton } from "../page-elements/IconButton"
import { IconGear } from "../icons/IconGear"
import { BoardToolbarDropdown } from "../dropdowns/BoardToolbarDropdown"
import { FilterButton } from "../page-elements/FilterButton"
import { Button } from "../page-elements/Button"
import { displayUser, getUserInitials } from "../../helpers/functions"

type FormValues = {
	query: string	
}

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	const { board, boardInfo: primaryBoardInfo, tickets, statusesToDisplay, groupBy } = useAppSelector((state) => state.board)
	const { filterButtonState, searchTerm, filters } = useAppSelector((state) => state.boardFilter)
	
	// Count active filters for the badge
	const numActiveFilters = Object.values(filters).filter(value => value !== null).length
	const { showModal } = useAppSelector((state) => state.modal)
	const { priorities } = useAppSelector((state) => state.priority)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { statuses } = useAppSelector((state) => state.status)
	const { width, height } = useScreenSize()
	const [showDropdown, setShowDropdown] = useState(false)
	const buttonRef = useRef(null)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)

	// get all unique assignees on all tickets
	const ticketAssigneeIds = useMemo(() => {
		const ticketAssigneeSet = new Set([...tickets.filter((ticket) => ticket.assignees && ticket.assignees.length > 0).map((ticket) => ticket?.assignees?.[0].id ?? 0)])
		return Array.from(ticketAssigneeSet)
	}, [tickets])

	// fetch the users that are assigned to the given tickets
	// this also has the nice side effect of only showing the assignees that are attached to any filtered tickets as well.
	console.log("ticketAssigneeIds: ", ticketAssigneeIds)
	const { data, isLoading } = useGetUserProfilesQuery(ticketAssigneeIds ? {userIds: [...ticketAssigneeIds]} : skipToken)
	const isAdminOrUserRole = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")

	const defaultForm: FormValues = {
		query: "",
	}
	const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const registerOptions = {
		query: {},
	}

	const onClickOutside = () => {
		setShowDropdown(false)	
	}

	useClickOutside(menuDropdownRef, onClickOutside, buttonRef)

	useEffect(() => {
		if (!showModal){
			setShowDropdown(false)
		}
	}, [showModal])

	const onSubmit = (values: FormValues) => {
		dispatch(setSearchTerm(values.query))
	}

	const prioritySort = (sortOrder: 1 | -1) => {
		let sortedBoard = sortByPriority(
			board, tickets, priorities, sortOrder, undefined
		)
		dispatch(setBoard(sortedBoard))
	}

	const onGroupBy = (option: GroupByOptionsKey) => {
		dispatch(setGroupBy(option))
	}

	return (
		<div className = "tw-py-4 tw-flex tw-flex-col tw-gap-y-2 xl:tw-gap-x-2 lg:tw-flex-row lg:tw-flex-wrap lg:tw-justify-between lg:tw-items-center">
			<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
				<FormProvider {...methods}>
					<form className = "tw-flex tw-flex-row tw-justify-between lg:tw-justify-normal lg:tw-items-center tw-gap-x-2">
						<SearchBar 
							registerOptions= { registerOptions.query }
							registerField={"query"}
							placeholder={"Search..."}
						/>
						<Button theme="primary" onClick={handleSubmit(onSubmit)}>Search</Button>
					
					</form>
				</FormProvider>
				<FilterButton 
					filterButtonState={filterButtonState}
					numFilters={numActiveFilters}
					onClick={() => {
						dispatch(setSecondaryModalType("BOARD_FILTER_MODAL"))
						dispatch(setSecondaryModalProps({boardId: primaryBoardInfo?.id ?? 0, isBulkEdit: false}))
						dispatch(toggleShowSecondaryModal(true))
					}}
				/>
				{!isLoading && width >= MD_BREAKPOINT && primaryBoardInfo?.assignees && primaryBoardInfo?.assignees?.length && data?.data.length ? 
					<OverlappingRow 
						ignoreScreenSize={true}
						imageSize={"m"} 
						imageUrls={
							data.data.map((data) => {
								return {
									name: displayUser(data), 
									imageUrl: data.imageUrl ?? "", 
									initials: getUserInitials(data)
								}
							})
						}
					/> : null
				}
			</div>
			<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
				<div>
					<Button theme="primary" onClick = {() => {
						dispatch(toggleShowModal(true))
						dispatch(setModalType("ADD_TICKET_FORM"))
						dispatch(setModalProps({statusesToDisplay: statuses, boardId: primaryBoardInfo?.id}))
					}}>Add Ticket</Button>
				</div>
				<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
					<label className = "label" htmlFor="board-group-by">Group By</label>
					<select 
						id = "board-group-by" 
						/* TODO: the margin top is coming from label CSS, need to refactor to make separate horizontal label class rather than
						forcing the margin top to 0 here */
						className = "__custom-select tw-bg-primary tw-border-primary tw-w-full !tw-mt-0 lg:tw-w-auto" 
						value={groupBy}
						onChange={(e) => onGroupBy(e.target.value as GroupByOptionsKey)}>
						{
							Object.keys(GROUP_BY_OPTIONS).map((groupByKey) => (
								<option key={`group_by_${groupByKey}`} value = {groupByKey}>{GROUP_BY_OPTIONS[groupByKey as GroupByOptionsKey]}</option>
							))
						}
					</select>
				</div>
				<div className = "tw-relative tw-inline-block">
					<button ref = {buttonRef} onClick={(e) => {
						setShowDropdown(!showDropdown)
					}} className = "--transparent tw-p-0 hover:tw-opacity-60"><IconGear className = "tw-w-6 tw-h-6"/></button>
					{
						showDropdown ? <BoardToolbarDropdown
							ref={menuDropdownRef}
							closeDropdown={onClickOutside}
							boardId={primaryBoardInfo?.id}
							statusesToDisplay={statusesToDisplay}
						/> : null
					}
				</div>
			</div>
		</div>
	)
}