import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { UserRegistrationRequest } from "../../types/common"
import { useGetRegistrationRequestsQuery } from "../../services/private/organization"
import { useRegistrationRequestConfig } from "../../helpers/table-config/useRegistrationRequestConfig"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { USER_REGISTRATION_REQUEST_URL } from "../../helpers/urls"
import { PaginationRow } from "../../components/page-elements/PaginationRow"

export const UsersDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [registrationRequestPage, setRegistrationRequestPage] = useState(1)
	const { data: registrationRequests, isFetching: isRegistrationRequestsFetching } = useGetRegistrationRequestsQuery()
	const config = useRegistrationRequestConfig()

	const setRegRequestPage = (page: number) => {
		setRegistrationRequestPage(page)
	}

	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-4">
			<div>
				<h1>Registration Requests</h1>
			</div>
			{isRegistrationRequestsFetching ? <LoadingSpinner/> : (
				<>
					<Table data={registrationRequests?.data} config={config}/>
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
		</div>
	)
}
