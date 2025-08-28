import React, {useState} from "react"
import { Table } from "../Table"
import { useGetProjectBoardsQuery } from "../../services/private/project"
import { useBoardConfig } from "../../helpers/table-config/useBoardConfig"
import { LoadingSpinner } from "../LoadingSpinner"
import { PaginationRow } from "../../components/page-elements/PaginationRow"

interface Props {
	projectId: number
	fullWidth: boolean
}

export const InnerProjectBoardsTable = ({projectId, fullWidth}: Props) => {
	const [page, setPage] = useState(1)
	const config = useBoardConfig()
	const { data, isFetching, isError } = useGetProjectBoardsQuery({id: projectId, urlParams: {"assignees": true, "numTickets": true, "lastModified": true, "page": page}})

	const setPageFunc = (page: number) => {
		setPage(page)
	}

	return (
		<>
		{
			isFetching ? <LoadingSpinner/> :
			<div className = "tw-space-y-2">
				<Table 
					config={config} 
					data={data?.data ?? []} 
					fullWidth={fullWidth}
					isNestedTable={true}
					tableKey={"project-boards"}
				/>
				{
					data?.pagination ? 
					<PaginationRow
						showPageNums={true}
						paginationData={data.pagination}	
						showNumResults={true}
						setPage={setPageFunc}
						currentPage={page}
					/> : null
				}
			</div>
		}
		</>
	)
}