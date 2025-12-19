import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams, useSearchParams, useNavigate } from "react-router-dom" 
import { toggleShowModal, setModalType } from "../../slices/modalSlice" 
import { Table } from "../../components/Table" 
import { Modal } from "../../components/Modal" 
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { PaginationRow } from "../../components/page-elements/PaginationRow"
import { SearchBar } from "../../components/SearchBar"
import { PROJECTS } from "../../helpers/routes"
import { useForm, FormProvider } from "react-hook-form"
import { withUrlParams } from "../../helpers/functions"
import { LoadingSkeleton } from "../../components/page-elements/LoadingSkeleton"
import { RowPlaceholder } from "../../components/placeholders/RowPlaceholder"
import { useProjectConfig } from "../../helpers/table-config/useProjectConfig"
import { useGetProjectsQuery } from "../../services/private/project"
import { Button } from "../../components/page-elements/Button"

type FormValues = {
    query?: string
}

export const ProjectTable = () => {
    const { projectId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const { userRoleLookup } = useAppSelector((state) => state.userRole)
    const { userProfile } = useAppSelector((state) => state.userProfile)
    const defaultForm: FormValues = {
        query: searchParams.get("query") ?? "",
    }
    const [preloadedValues, setPreloadedValues] = useState<FormValues>(defaultForm)
    const methods = useForm<FormValues>({defaultValues: preloadedValues})
    const { register, handleSubmit, reset, watch, setValue, formState: {errors} } = methods

    const config = useProjectConfig()
    const dispatch = useAppDispatch()
    const pageParam = (searchParams.get("page") != null && searchParams.get("page") !== "" ? searchParams.get("page") : "") as string
    const currentPage = pageParam !== "" ? parseInt(pageParam) : 1
    const { data, isLoading, isFetching, isError } = useGetProjectsQuery({urlParams: {query: searchParams.get("query") ?? "", page: currentPage}})

    const addNewProject = () => {
        dispatch(toggleShowModal(true))
        dispatch(setModalType("PROJECT_FORM"))
    }

    const setPage = (pageNum: number) => {
        let pageUrl = `${PROJECTS}?page=${pageNum}`
        pageUrl = withUrlParams(defaultForm, searchParams, pageUrl)
        navigate(pageUrl, {replace:true});
    }

    const onSubmit = (values: FormValues) => {
        setSearchParams({
            page: "1",
            ...values
        })  
    }
    return (
    <div className = "tw-space-y-4">
        <div>
            <h1>Projects</h1>
        </div>
        {isLoading ? 
        <LoadingSkeleton width="tw-w-full" height="tw-h-84">
            <RowPlaceholder/>   
        </LoadingSkeleton> : (
            <>
                <div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-gap-x-2">
                    <FormProvider {...methods}>
                        <form className = "tw-flex tw-flex-row tw-gap-x-2" onSubmit={handleSubmit(onSubmit)}>
                            <SearchBar placeholder={"Search..."} registerField={"query"} registerOptions={{}}/>
                            <Button theme="primary" type = "submit">Search</Button>
                        </form>
                        {userProfile && (userRoleLookup[userProfile.userRoleId] === "ADMIN" || userRoleLookup[userProfile.userRoleId] === "BOARD_ADMIN") ? (
                            <div>
                                <Button theme="primary" onClick={(e) => {
                                    e.preventDefault()
                                    addNewProject()
                                }}>Add New Project</Button>
                            </div>
                        ) : null}
                    </FormProvider>
                </div>
                {errors?.query ? <small className = "--text-alert">{errors?.query?.message}</small> : null}
                <Table config={config} data={data?.data ?? []} tableKey={"projects"}/>
                <div className = "tw-w-fit tw-p-4 tw-border tw-border-gray-300">
                    <PaginationRow
                        showNumResults={true}
                        showPageNums={true}
                        setPage={setPage}   
                        paginationData={data?.pagination}
                        currentPage={currentPage}
                        urlParams={defaultForm}
                        url={PROJECTS}    
                    />
                </div>
            </>
        )}
    </div>
    )
}
