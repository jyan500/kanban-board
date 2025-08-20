import React, { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Outlet, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Table } from "../../components/Table" 
import { UserRegistrationRequest } from "../../types/common"
import { useGetUserProfilesQuery } from "../../services/private/userProfile"
import { useGetRegistrationRequestsQuery } from "../../services/private/registrationRequest"
import { useRegistrationRequestConfig } from "../../helpers/table-config/useRegistrationRequestConfig"
import { useUserProfileConfig } from "../../helpers/table-config/useUserProfileConfig"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { USERS } from "../../helpers/routes"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { BulkEditToolbar } from "../../components/page-elements/BulkEditToolbar"
import { useForm, FormProvider } from "react-hook-form"
import { getUserInitials, withUrlParams } from "../../helpers/functions"
import { SearchBar } from "../../components/SearchBar"
import { RowContentLoading } from "../../components/page-elements/RowContentLoading"

type RegFormValues = {
	regQuery: string
}

type UserFormValues = {
	userQuery: string
}

type Filters = RegFormValues & UserFormValues

type UserFormProps = {
	filters: Filters
}

const UserForm = ({filters}: UserFormProps) => {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const userPageParam = (searchParams.get("userPage") != null && searchParams.get("userPage") !== "" ? searchParams.get("userPage") : "") as string
	const userCurrentPage = userPageParam !== "" ? parseInt(userPageParam) : 1
	const regPageParam = (searchParams.get("regPage") != null && searchParams.get("regPage") !== "" ? searchParams.get("regPage") : "") as string
	const regCurrentPage = regPageParam !== "" ? parseInt(regPageParam) : 1
	const userDefaultForm: UserFormValues = {
		userQuery: searchParams.get("userQuery") ?? "",
	}
	const { data: userProfiles, isLoading: isUserProfilesLoading } = useGetUserProfilesQuery({userQuery: searchParams.get("userQuery") ?? "", page: userCurrentPage})
	const [preloadedValues, setPreloadedValues] = useState(userDefaultForm)
	const methods = useForm<UserFormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const userProfileConfig = useUserProfileConfig()

	const registerOptions = {
	}

	const setUserProfPage = (page: number) => {
		let pageUrl = `${USERS}?regPage=${regCurrentPage}&userPage=${page}`
		pageUrl = withUrlParams(filters, searchParams, pageUrl)
	    navigate(pageUrl, {replace:true});
	}

	const onSubmit = (values: UserFormValues) => {
		setSearchParams({
			userPage: "1",
			regPage: regPageParam,
			...filters,
			...values,
		})
	}

	return (
		isUserProfilesLoading ? <RowContentLoading height={"tw-h-[400px]"}/> : (
			<div className = "tw-flex tw-flex-col tw-gap-y-4">
				<div>
					<h1>Users</h1>
				</div>
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<FormProvider {...methods}>
						<form className = "tw-flex tw-flex-row tw-gap-x-2" onSubmit={handleSubmit(onSubmit)}>
							<SearchBar placeholder={"Search..."} registerField={"userQuery"} registerOptions={{}}/>
							<button type = "submit" className = "button">Search</button>
						</form>
					</FormProvider>
				</div>
				{errors?.userQuery ? <small className = "--text-alert">{errors?.userQuery?.message}</small> : null}
				<Table tableKey={"display-user"} data={userProfiles?.data.map((userProfile) => {
					return {
						...userProfile,
						imageUrl: {url: userProfile.imageUrl, initials: getUserInitials(userProfile)}
					}
				})} config={userProfileConfig}/>
				<div className = "tw-p-4 tw-border tw-border-gray-300">
					<PaginationRow
						showNumResults={true}
						showPageNums={true}
						setPage={setUserProfPage}	
						paginationData={userProfiles?.pagination}
						customPageParam={"userPage"}
						currentPage={userCurrentPage}
						urlParams={{...filters, regPage: regCurrentPage}}
						url={USERS}	
					/>
				</div>							
			</div>	
		)
	)
}

type RegFormProps = {
	filters: Filters
}

const RegForm = ({filters}: RegFormProps) => {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const regPageParam = (searchParams.get("regPage") != null && searchParams.get("regPage") !== "" ? searchParams.get("regPage") : "") as string
	const regCurrentPage = regPageParam !== "" ? parseInt(regPageParam) : 1
	const userPageParam = (searchParams.get("userPage") != null && searchParams.get("userPage") !== "" ? searchParams.get("userPage") : "") as string
	const userCurrentPage = userPageParam !== "" ? parseInt(userPageParam) : 1
	const [ regSelectedIds, setRegSelectedIds ] = useState<Array<number>>([])
	const { data: registrationRequests, isLoading: isRegistrationRequestsLoading } = useGetRegistrationRequestsQuery({regQuery: searchParams.get("regQuery") ?? "", page: regCurrentPage})
	const regDefaultForm: RegFormValues = {
		regQuery: searchParams.get("regQuery") ?? "",
	}
	const [preloadedValues, setPreloadedValues] = useState(regDefaultForm)
	const methods = useForm<RegFormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods
	const regRequestConfig = useRegistrationRequestConfig(regSelectedIds, setRegSelectedIds, true)

	const registerOptions = {
	}

	const setRegRequestPage = (page: number) => {
		let pageUrl = `${USERS}?regPage=${page}&userPage=${userCurrentPage}`
		pageUrl = withUrlParams(filters, searchParams, pageUrl)
	    navigate(pageUrl, {replace:true});	
	}

	const onSubmit = (values: RegFormValues) => {
		setSearchParams({
			regPage: "1",
			userPage: userPageParam,
			...filters,
			...values,
		})
	}

	return (
		isRegistrationRequestsLoading ? <RowContentLoading height={"tw-h-[400px]"}/> : (
			<div className = "tw-flex tw-flex-col tw-gap-y-4">
				<div>
					<h1>Registration Requests</h1>
				</div>
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<FormProvider {...methods}>
						<form className = "tw-flex tw-flex-row tw-gap-x-2" onSubmit={handleSubmit(onSubmit)}>
							<SearchBar placeholder={"Search..."} registerField={"regQuery"} registerOptions={{}}/>
							<button type = "submit" className = "button">Search</button>
						</form>
					</FormProvider>
				</div>
				{errors?.regQuery ? <small className = "--text-alert">{errors?.regQuery?.message}</small> : null}
				<BulkEditToolbar 
					updateIds={(ids: Array<number>) => setRegSelectedIds(ids)} 
					itemIds={regSelectedIds} 
					applyActionToAll={() => regRequestConfig.bulkEdit.approveAll()} 
					applyRemoveToAll={() => regRequestConfig.bulkEdit.denyAll()}
					removeText={"Deny All"}
					actionText = {"Approve All"}
				/>
				<Table 
					tableKey={"reg-request"} 
					itemIds={regSelectedIds} 
					data={registrationRequests?.data} 
					config={regRequestConfig}
				/>
				<div className = "tw-p-4 tw-border tw-border-gray-300">
					<PaginationRow
						showNumResults={true}
						showPageNums={true}
						setPage={setRegRequestPage}	
						paginationData={registrationRequests?.pagination}
						customPageParam={"regPage"}
						currentPage={regCurrentPage}
						urlParams={{...filters, userPage: userCurrentPage}}
						url={USERS}	
					/>
				</div>
			</div>
		)
	)
}

export const UsersDisplay = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const filters = {
		regQuery: searchParams.get("regQuery") ?? "",
		userQuery: searchParams.get("userQuery") ?? "",
	}
	return (
		<>
			<RegForm filters={filters}/>	
			<UserForm filters={filters}/>	
		</>
	)
}
