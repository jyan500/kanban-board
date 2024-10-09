import React, {useState, useEffect} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { SearchBar } from "../SearchBar" 
import "../../styles/toolbar.css"
import { useForm, FormProvider } from "react-hook-form"
import { IPagination } from "../../types/common"
import { PaginationRow } from "../page-elements/PaginationRow"

type FormValues = {
	query: string	
}

type Props = {
	currentPage: number
	paginationData: IPagination | undefined
	setPage: (pageNum: number) => void
}

export const SearchToolBar = ({currentPage, paginationData, setPage}: Props) => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
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

	const onSubmit = (values: FormValues) => {
		// if (values.query === ""){
		// 	dispatch(setFilteredTickets(tickets))
		// }
		// else {
		// 	const filtered = tickets.filter((obj) => obj.name.toLowerCase().includes(values.query.toLowerCase()))
		// 	dispatch(setFilteredTickets(filtered))
		// }
	}

	return (
		<div className = "tw-w-full tw-flex tw-flex-row tw-items-center tw-justify-between">
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
			<PaginationRow
				showPageNums={false}
				currentPage={currentPage}
				paginationData={paginationData}
				setPage={setPage}
			/>
		</div>
	)
}