import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SearchBar } from "./SearchBar" 
import "../styles/toolbar.css"
import { setBoard, setFilteredTickets } from "../slices/boardSlice" 
import { toggleShowModal, setModalProps, setModalType } from "../slices/modalSlice" 
import { prioritySort as sortByPriority } from "../helpers/functions"
import { useForm, FormProvider } from "react-hook-form"
import { useDebouncedValue } from "../hooks/useDebouncedValue" 
import { OverlappingRow } from "./OverlappingRow" 
import { Board } from "../types/common"
import { useGetUserProfilesQuery } from "../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'

type FormValues = {
	query: string	
}

export const ToolBar = () => {
	const dispatch = useAppDispatch()
	const { board, boardInfo: primaryBoardInfo, tickets, statusesToDisplay } = useAppSelector((state) => state.board)
	const { priorities } = useAppSelector((state) => state.priority)
	const { userProfile } = useAppSelector((state) => state.userProfile)
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

	return (
		<div className = "tw-py-4 tw-flex tw-flex-row tw-items-center">
			<FormProvider {...methods}>
				<form className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
					<SearchBar 
						registerOptions= { registerOptions.query }
						registerField={"query"}
						placeholder={"Search..."}
					/>
					<button onClick={handleSubmit(onSubmit)} className = "button tw-bg-primary">Search</button>
				</form>
			</FormProvider>
			<div>
				{!isFetching && primaryBoardInfo?.assignees && primaryBoardInfo?.assignees?.length > 0 ? 
					<OverlappingRow imageUrls={data?.data?.map((data) => data.imageUrl ?? "") ?? []}/>
					: null
				}
			</div>
			<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
				<button className = "button" onClick = {() => {
					dispatch(toggleShowModal(true))
					dispatch(setModalType("ADD_TICKET_FORM"))
					dispatch(setModalProps({statusesToDisplay: statusesToDisplay, boardId: primaryBoardInfo?.id}))
				}}>Add Ticket</button>
				{
					isAdminOrUserRole ? (
					<button className = "button" onClick = {() => {
						dispatch(toggleShowModal(true))
						dispatch(setModalType("STATUS_FORM"))
					}}>Edit Statuses</button>) : null
				}
				<button className = "button" onClick = {(e) => prioritySort(1)}>Sort By Priority</button>
			</div>
		</div>
	)
}