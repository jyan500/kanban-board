import React, {useState} from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { useUserProfileRegistrationRequestConfig } from "../../helpers/table-config/useUserProfileRegistrationRequestConfig"
import { useGetUserRegistrationRequestsQuery } from "../../services/private/registrationRequest"
import { useForm, FormProvider } from "react-hook-form"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { Table } from "../../components/Table"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { ACCOUNT_REGISTRATION_REQUESTS } from "../../helpers/routes"
import { SearchBar } from "../../components/SearchBar"
import { withUrlParams } from "../../helpers/functions"
import { RowContentLoading } from "../../components/page-elements/RowContentLoading"

type FormValues = {
	query: string
}

export const RegistrationRequests = () => {
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [searchParams, setSearchParams] = useSearchParams()
	const navigate = useNavigate()
	const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
	const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
	const config = useUserProfileRegistrationRequestConfig()
	const { data, isLoading, isFetching } = useGetUserRegistrationRequestsQuery(userProfile ? {userId: userProfile.id, urlParams: {page: currentPage, query: searchParams.get("query") ?? ""}} : skipToken)
	const defaultForm: FormValues = {
		query: searchParams.get("query") ?? "",
	}
	const [preloadedValues, setPreloadedValues] = useState(defaultForm)
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods

	const onSubmit = (values: FormValues) => {
		setSearchParams({
			...values,
			page: "1"
		})
	}

	const setPage = (page: number) => {
		let pageUrl = `${ACCOUNT_REGISTRATION_REQUESTS}?page=${page}`
		pageUrl = withUrlParams(defaultForm, searchParams, pageUrl)
	    navigate(pageUrl, {replace:true});	
	}

	return (
		<div>
			<div className = "tw-flex tw-flex-col tw-gap-y-4">
				<div>
					<h1>Registration Requests</h1>
				</div>
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<FormProvider {...methods}>
						<form className = "tw-flex tw-flex-row tw-gap-x-2" onSubmit={handleSubmit(onSubmit)}>
							<SearchBar placeholder={"Search..."} registerField={"query"} registerOptions={{}}/>
							<button type = "submit" className = "button">Search</button>
						</form>
					</FormProvider>
				</div>
				{
					isLoading ? (
						<RowContentLoading/>	
					) : (
						<>
							<Table 
								tableKey={"reg"} 
								data={data?.data} 
								config={config}
							/>
							<div className = "tw-p-4 tw-border tw-border-gray-300">
								<PaginationRow
									showNumResults={true}
									showPageNums={true}
									setPage={setPage}	
									paginationData={data?.pagination}
									currentPage={currentPage}
									urlParams={{...defaultForm, page: currentPage}}
									url={ACCOUNT_REGISTRATION_REQUESTS}	
								/>
							</div>
						</>
					)
				}
			</div>
		</div>
	)	
}
