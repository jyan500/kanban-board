import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { SearchBar } from "../SearchBar" 
import "../../styles/toolbar.css"
import { useFormContext, FormProvider, SubmitHandler } from "react-hook-form"
import { IPagination } from "../../types/common"
import { PaginationRow } from "../page-elements/PaginationRow"
import { FormValues } from "../../pages/tickets/TicketDisplay"
import { MdOutlineKeyboardArrowDown as ArrowDown } from "react-icons/md";
import { Filters } from "./Filters"
import { Filters as FiltersType } from "../../pages/tickets/TicketDisplay"

type Props = {
	currentPage: number
	paginationData: IPagination | undefined
	setPage: (pageNum: number) => void
	registerOptions: Record<string, any>
	onFormSubmit: () => void
	filters: Array<string>,
}

export const SearchToolBar = ({onFormSubmit, registerOptions, currentPage, paginationData, setPage, filters}: Props) => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const [showFilter, setShowFilter] = useState(false)
	const isAdminOrUserRole = userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN")
	const methods = useFormContext()
	const searchOptions = {"title": "Title", "reporter": "Reporter", "assignee": "Assignee"}
	const {register, reset, getValues, formState: {errors}} = methods

	return (
		<div className = "tw-w-full tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-w-full tw-flex tw-flex-row tw-items-center tw-justify-between">
				<FormProvider {...methods}>
					<form onSubmit={(e) => {
						e.preventDefault()
						onFormSubmit()
					}} className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
						<select {...register("searchBy", registerOptions.searchBy)}>
							{Object.keys(searchOptions).map((option) => {
								const value = searchOptions[option as keyof typeof searchOptions]
								return <option key = {option} value = {option}>{value}</option>
							})}
						</select>
						<div className = "tw-flex tw-flex-col tw-gap-y-2">
							<SearchBar 
								registerOptions= { registerOptions.query }
								registerField={"query"}
								placeholder={"Search..."}
							/>
						</div>
						<button type = "button" onClick={(e) => {
							e.preventDefault()
							onFormSubmit()
						}} className = "button">Search</button>
						<button onClick={() => setShowFilter(!showFilter)} type = "button" className = "button">
							<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-0.5">
								<ArrowDown className = "tw-w-6 tw-h-6"/>
								<span>Filters</span>	
							</div>
						</button>
						{showFilter ? (
							<button onClick={(e) => {
								e.preventDefault()
								reset({
									...getValues(),
									...(filters.reduce((acc: Record<string, any>, filterKey: string) => {
										acc[filterKey] = ""
										return acc
									}, {})),
								})
							}} type = "button" className = "button !tw-bg-secondary">
								Clear Filters
							</button>
						) : null}
					</form>
				</FormProvider>
				<div className = "tw-p-4 tw-rounded-md tw-border tw-border-gray-300">
					<PaginationRow
						showPageNums={false}
						setPage={setPage}
						currentPage={currentPage}
						paginationData={paginationData}
					/>
				</div>
			</div>
			{/* 
			For some reason, error messages when retrieved from useFormContext() have to be converted to strings explicitly, see below:
			https://stackoverflow.com/questions/73222938/type-mergefielderror-fielderrorsimpldeeprequiredany-undefined-is-not 
			*/}
			{errors?.query ? <small className = "--text-alert">{errors?.query?.message?.toString()}</small> : null}
			<div>
			{
				showFilter ? (
					<FormProvider {...methods}>
						<Filters/>
					</FormProvider>
				) : null
			}
			</div>
		</div>
	)
}