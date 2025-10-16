import React, {useState} from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Table } from "../../components/Table"
import { useBoardSprintConfig } from "../../helpers/table-config/useBoardSprintConfig"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetSprintsQuery } from "../../services/private/sprint"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { SearchToolBar } from "../../components/tickets/SearchToolBar"
import { useForm, FormProvider } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { BOARDS, BACKLOG } from "../../helpers/routes"
import { Button } from "../../components/page-elements/Button"

export interface FormValues { 
	query: string
	searchBy: string
}

export const BoardSprints = () => {
	const [page, setPage] = useState(1)
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const defaultForm: FormValues = {
		query: "",
		searchBy: "name",
	}

    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { handleSubmit } = methods
	const { boardInfo } = useAppSelector((state) => state.board)
	const {data, isLoading} = useGetSprintsQuery(boardInfo ? {urlParams: {
		...preloadedValues,
		page: page,
		boardId: boardInfo.id,
        recent: true,
		includeTicketStats: true,
	}} : skipToken)
	const config = useBoardSprintConfig(boardInfo?.id ?? 0)
	const boardPage = `${BOARDS}/${boardInfo?.id}`

	const onSubmit = (values: FormValues) => {
		setPage(1)
		setPreloadedValues(values)
	}

	return (
		<div>
			{
				!data ? 
				<LoadingSkeleton>
					<RowPlaceholder/>
				</LoadingSkeleton> : (
					<div className = "tw-flex tw-flex-col tw-gap-y-4">
						<FormProvider {...methods}>
							<div>
	                            <SearchToolBar 
	                                paginationData={data.pagination} 
	                                setPage={setPage} 
	                                currentPage={page ?? 1}
	                                registerOptions={{}}
	                                onFormSubmit={() => {
	                                    handleSubmit(onSubmit)()
	                                }}
	                                hidePagination={true}
	                                additionalButtons={() => {
	                                	return (<>
								<Button theme="primary" onClick={(e) => {
							                            	navigate(`${boardPage}/${BACKLOG}`, {state: {"createSprint": true}})
							                            }} >Create Sprint</Button>
	                                	</>)
	                                }}
	                            >
	                            </SearchToolBar>
	                        </div>
                        </FormProvider>
						<Table
							data={data.data}
							config={config}
						/>
						<div className = "tw-w-fit tw-p-4 tw-border tw-border-gray-300">
							<PaginationRow
								showNumResults={true}
								showPageNums={true}
								setPage={setPage}	
								paginationData={data?.pagination}
								currentPage={page}
								urlParams={defaultForm}
								url={BOARDS}	
							/>
						</div>
					</div>
				)
			}
		</div>
	)
}
