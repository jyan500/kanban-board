import React from "react"
import { Table } from "../Table"
import { useGetProjectBoardsQuery } from "../../services/private/project"
import { useBoardConfig } from "../../helpers/table-config/useBoardConfig"
import { LoadingSpinner } from "../LoadingSpinner"

interface Props {
	projectId: number
	fullWidth: boolean
}

export const InnerProjectBoardsTable = ({projectId, fullWidth}: Props) => {
	const config = useBoardConfig()
	const { data, isFetching, isError } = useGetProjectBoardsQuery({id: projectId, urlParams: {"assignees": true, "numTickets": true, "lastModified": true}})
	return (
		<>
		{
			isFetching ? <tr><LoadingSpinner/></tr> :
			<Table 
				config={config} 
				data={data?.data ?? []} 
				fullWidth={fullWidth}
				isNestedTable={true}
				tableKey={"project-boards"}
			/>
		}
		</>
	)
}