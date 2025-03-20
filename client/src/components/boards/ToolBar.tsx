import React, {useState, useEffect, useRef} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { SearchBar } from "../SearchBar" 
import "../../styles/toolbar.css"
import { setBoard, setFilteredTickets, setGroupBy } from "../../slices/boardSlice" 
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice" 
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
import { IconButton } from "../page-elements/IconButton"
import { IconGear } from "../icons/IconGear"
import { BoardToolbarDropdown } from "../dropdowns/BoardToolbarDropdown"

type FormValues = {
	query: string	
}

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	const { board, boardInfo: primaryBoardInfo, tickets, statusesToDisplay, groupBy } = useAppSelector((state) => state.board)
	const { showModal } = useAppSelector((state) => state.modal)
	const { priorities } = useAppSelector((state) => state.priority)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { statuses } = useAppSelector((state) => state.status)
	const { width, height } = useScreenSize()
	const [showDropdown, setShowDropdown] = useState(false)
	const buttonRef = useRef(null)
	const menuDropdownRef = useRef<HTMLDivElement>(null)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { data, isFetching} = useGetUserProfilesQuery(primaryBoardInfo?.assignees ? {userIds: primaryBoardInfo?.assignees} : skipToken)
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

	// const debouncedSearchTerm = useDebouncedValue(value, 300)

	// useEffect(() => {
	// 	if (value === ""){
	// 		dispatch(setFilteredTickets(tickets))
	// 	}
	// 	else {
	// 		const filtered = tickets.filter((obj) => obj.name.toLowerCase().includes(value.toLowerCase()))
	// 		dispatch(setFilteredTickets(filtered))
	// 	}	
	// }, [debouncedSearchTerm])

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
		if (values.query === ""){
			dispatch(setFilteredTickets(tickets))
		}
		else {
			const filtered = tickets.filter((obj) => obj.name.toLowerCase().includes(values.query.toLowerCase()))
			dispatch(setFilteredTickets(filtered))
		}
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
			<FormProvider {...methods}>
				<form className = "tw-flex tw-flex-row tw-justify-between lg:tw-justify-normal lg:tw-items-center tw-gap-x-2">
					<SearchBar 
						registerOptions= { registerOptions.query }
						registerField={"query"}
						placeholder={"Search..."}
					/>
					<button onClick={handleSubmit(onSubmit)} className = "button tw-bg-primary">Search</button>
				</form>
			</FormProvider>
		{/*	<div>
				{!isFetching && width >= MD_BREAKPOINT && primaryBoardInfo?.assignees && primaryBoardInfo?.assignees?.length > 0 ? 
					<OverlappingRow imageUrls={data?.data?.map((data) => data.imageUrl ?? "") ?? []}/>
					: null
				}
			</div>*/}
			<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-items-center lg:tw-gap-x-2">
				<button className = "button" onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("ADD_TICKET_FORM"))
					dispatch(setModalProps({statusesToDisplay: statuses, boardId: primaryBoardInfo?.id}))
				}}>Add Ticket</button>
				{
					isAdminOrUserRole ? (
					<button className = "button" onClick = {() => {
						dispatch(toggleShowModal(true))
						dispatch(setModalType("BOARD_STATUS_FORM"))
					}}>Edit Columns</button>) : null
				}
				{/*<button className = "button" onClick = {(e) => prioritySort(1)}>Sort By Priority</button>*/}
				<div className = "tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-center tw-gap-y-2 lg:tw-gap-x-2">
					<label className = "label" htmlFor="board-group-by">Group By</label>
					<select 
						style={{
						}}
						id = "board-group-by" 
						/* TODO: the margin top is coming from label CSS, need to refactor to make separate horizontal label class rather than
						forcing the margin top to 0 here */
						className = "__custom-select tw-bg-primary tw-w-full !tw-mt-0 lg:tw-w-auto" 
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