import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams, useSearchParams, useNavigate } from "react-router-dom" 
import { toggleShowModal, setModalType } from "../../slices/modalSlice" 
import { Table } from "../../components/Table" 
import { useBoardConfig, BoardConfigType } from "../../helpers/table-config/useBoardConfig" 
import { useGetBoardsQuery } from "../../services/private/board"
import { Modal } from "../../components/Modal" 
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { BOARDS } from "../../helpers/routes"

export const Boards = () => {
	const { boardId } = useParams()
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const { userRoleLookup } = useAppSelector((state) => state.userRole)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const config: BoardConfigType = useBoardConfig()
	const dispatch = useAppDispatch()
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const {data, isFetching } = useGetBoardsQuery({page: currentPage, lastModified: true, numTickets: true, assignees: true})

	const addNewBoard = () => {
		dispatch(toggleShowModal(true))
		dispatch(setModalType("BOARD_FORM"))
	}

	const setPage = (pageNum: number) => {
		let pageUrl = `${BOARDS}?page=${pageNum}`
		// pageUrl = withUrlParams(pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<div>
				<h1>Boards</h1>
				{userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN") ? (
					<button className = "button" onClick={addNewBoard}>Add New Board</button>
				) : null}
			</div>
			{isFetching ? <LoadingSpinner/> : (
				<>
					<Table data={data?.data} config={config}/>
					<div className = "tw-p-4 tw-border tw-border-gray-300">
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setPage}	
							paginationData={data?.pagination}
							currentPage={currentPage}
							// urlParams={defaultForm}
							url={BOARDS}	
						/>
					</div>
				</>
			)}
		</div>
	)
}
