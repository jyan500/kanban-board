import React, {useState} from "react"
import { Table } from "../Table"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { useGetProjectBoardsQuery } from "../../services/private/project"
import { useBoardConfig } from "../../helpers/table-config/useBoardConfig"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../placeholders/RowPlaceholder"
import { PaginationRow } from "../page-elements/PaginationRow"
import { Button } from "../page-elements/Button"
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice"

interface Props {
	projectId: number
	fullWidth: boolean
}

export const InnerProjectBoardsTable = ({projectId, fullWidth}: Props) => {
	const dispatch = useAppDispatch()
	const [page, setPage] = useState(1)
	const config = useBoardConfig()
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data, isLoading, isError } = useGetProjectBoardsQuery({id: projectId, urlParams: {"assignees": true, "numTickets": true, "lastModified": true, "page": page}})

	const addNewBoard = () => {
		dispatch(toggleShowModal(true))
		dispatch(setModalProps({
			"projectId": projectId
		}))
		dispatch(setModalType("BOARD_FORM"))
	}


	const setPageFunc = (page: number) => {
		setPage(page)
	}

	return (
		<>
		{
			isLoading ?
			 <LoadingSkeleton width="tw-w-full" height="tw-h-48">
				<RowPlaceholder/>	
			</LoadingSkeleton> :
			<div className = "tw-space-y-2">
				{

					userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN") ? (
						<Button onClick={addNewBoard} theme={"secondary"}>Add Board</Button>
					) : null
				}
				<Table 
					config={config} 
					data={data?.data ?? []} 
					fullWidth={fullWidth}
					isNestedTable={true}
					tableKey={"project-boards"}
				/>
				{data?.pagination.nextPage || data?.pagination.prevPage ? (
					<PaginationRow
						showNumResults={true}
						showPageNums={false}
						setPage={setPageFunc}	
						paginationData={data?.pagination}
						currentPage={page}
					/>
				) : null
			}
			</div>
		}
		</>
	)
}
