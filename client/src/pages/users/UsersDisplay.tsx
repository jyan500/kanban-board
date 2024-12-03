import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Table } from "../../components/Table" 
import { UserRegistrationRequest } from "../../types/common"
import { useGetUserProfilesQuery } from "../../services/private/userProfile"
import { useGetRegistrationRequestsQuery } from "../../services/private/organization"
import { useRegistrationRequestConfig } from "../../helpers/table-config/useRegistrationRequestConfig"
import { useUserProfileConfig } from "../../helpers/table-config/useUserProfileConfig"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { USERS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"

export const UsersDisplay = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const regPageParam = (searchParams.get("regPage") != null && searchParams.get("regPage") !== "" ? searchParams.get("regPage") : "") as string
	const regCurrentPage = regPageParam !== "" ? parseInt(regPageParam) : 1
	const userPageParam = (searchParams.get("userPage") != null && searchParams.get("userPage") !== "" ? searchParams.get("userPage") : "") as string
	const userCurrentPage = userPageParam !== "" ? parseInt(userPageParam) : 1
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { data: registrationRequests, isFetching: isRegistrationRequestsFetching } = useGetRegistrationRequestsQuery({page: regCurrentPage})
	const { data: userProfiles, isFetching: isUserProfilesFetching } = useGetUserProfilesQuery({page: userCurrentPage})
	const regRequestConfig = useRegistrationRequestConfig()
	const userProfileConfig = useUserProfileConfig()

	const setRegRequestPage = (page: number) => {
		let pageUrl = `${USERS}?regPage=${page}&userPage=${userCurrentPage}`
		// pageUrl = withUrlParams(pageUrl)
	    navigate(pageUrl, {replace:true});	
	}

	const setUserProfPage = (page: number) => {
		let pageUrl = `${USERS}?regPage=${regCurrentPage}&userPage=${page}`
		// pageUrl = withUrlParams(pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">

			{isRegistrationRequestsFetching ? <LoadingSpinner/> : (
				<>
					<div>
						<h1>Registration Requests</h1>
					</div>
					<BulkEditToolbar updateIds={regRequestConfig.bulkEdit.updateIds} itemIds={regRequestConfig.bulkEdit.getIds()} applyActionToAll={() => regRequestConfig.bulkEdit.approveAll()} text = {"Approve All"}/>
					<Table tableKey={"reg-request"} itemIds={regRequestConfig.bulkEdit.getIds()} data={registrationRequests?.data} config={regRequestConfig}/>
					<div className = "tw-p-4 tw-border tw-border-gray-300">
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setRegRequestPage}	
							paginationData={registrationRequests?.pagination}
							customPageParam={"regPage"}
							currentPage={regCurrentPage}
							urlParams={{userPage: userCurrentPage}}
							url={USERS}	
						/>
					</div>
				</>
			)}
			{
				isUserProfilesFetching ? <LoadingSpinner/> : (
					<>
						<div>
							<h1>Users</h1>
						</div>
						<Table tableKey={"display-user"} data={userProfiles?.data} config={userProfileConfig}/>
						<div className = "tw-p-4 tw-border tw-border-gray-300">
							<PaginationRow
								showNumResults={true}
								showPageNums={true}
								setPage={setUserProfPage}	
								paginationData={userProfiles?.pagination}
								customPageParam={"userPage"}
								currentPage={userCurrentPage}
								urlParams={{regPage: regCurrentPage}}
								url={USERS}	
							/>
						</div>							
					</>	
				)
			}
		</div>
	)
}
