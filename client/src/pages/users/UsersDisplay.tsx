import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { UserRegistrationRequest } from "../../types/common"
import { useGetUserProfilesQuery } from "../../services/private/userProfile"
import { useGetRegistrationRequestsQuery } from "../../services/private/organization"
import { useRegistrationRequestConfig } from "../../helpers/table-config/useRegistrationRequestConfig"
import { useUserProfileConfig } from "../../helpers/table-config/useUserProfileConfig"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { USER_REGISTRATION_REQUEST_URL, USER_PROFILE_URL } from "../../helpers/urls"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"

export const UsersDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [registrationRequestPage, setRegistrationRequestPage] = useState(1)
	const [userProfilePage, setUserProfilePage] = useState(1)
	const { data: registrationRequests, isFetching: isRegistrationRequestsFetching } = useGetRegistrationRequestsQuery()
	const { data: userProfiles, isFetching: isUserProfilesFetching } = useGetUserProfilesQuery({})
	const regRequestConfig = useRegistrationRequestConfig()
	const userProfileConfig = useUserProfileConfig()

	const setRegRequestPage = (page: number) => {
		setRegistrationRequestPage(page)
	}

	const setUserProfPage = (page: number) => {
		setUserProfilePage(page)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">

			{isRegistrationRequestsFetching ? <LoadingSpinner/> : (
				<>
					<div>
						<h1>Registration Requests</h1>
					</div>
					<BulkEditToolbar applyActionToAll={() => regRequestConfig.bulkEdit.approveAll()} text = {"Approve All"}/>
					<Table data={registrationRequests?.data} config={regRequestConfig}/>
					<div className = "tw-p-4 tw-border tw-border-gray-300">
						<PaginationRow
							showNumResults={true}
							showPageNums={true}
							setPage={setRegRequestPage}	
							paginationData={registrationRequests?.pagination}
							currentPage={registrationRequestPage}
							// urlParams={defaultForm}
							url={USER_REGISTRATION_REQUEST_URL}	
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
						<Table data={userProfiles?.data} config={userProfileConfig}/>
						<div className = "tw-p-4 tw-border tw-border-gray-300">
							<PaginationRow
								showNumResults={true}
								showPageNums={true}
								setPage={setUserProfPage}	
								paginationData={userProfiles?.pagination}
								currentPage={userProfilePage}
								// urlParams={defaultForm}
								url={USER_PROFILE_URL}	
							/>
						</div>							
					</>	
				)
			}
		</div>
	)
}
