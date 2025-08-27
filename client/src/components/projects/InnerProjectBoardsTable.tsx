import React from "react"
import { Table } from "../Table"
import { useGetProjectBoardsQuery } from "../../services/private/project"
import { useBoardConfig } from "../../helpers/table-config/useBoardConfig"
import { LoadingSpinner } from "../LoadingSpinner"

interface Props {
	projectId: number
}

export const InnerProjectBoardsTable = ({projectId}: Props) => {
	const config = useBoardConfig()
	const { data, isFetching, isError } = useGetProjectBoardsQuery({id: projectId, urlParams: {"assignees": true}})
	return (
		<>
		{
			isFetching ? <LoadingSpinner/> :
			<Table 
				config={config} 
				data={data?.data ?? []} 
				isNestedTable={true}
				tableKey={"project-boards"}
			/>
		}
		</>
	)
}