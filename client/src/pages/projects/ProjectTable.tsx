import React, { useState } from 'react';
import { Table } from "../../components/Table"
import { Board } from "../../types/common"
import { useProjectConfig } from "../../helpers/table-config/useProjectConfig"
import { IconArrowDown } from "../../components/icons/IconArrowDown"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { useGetProjectsQuery } from "../../services/private/project"

export const ProjectTable = () => {
    const config = useProjectConfig()
    const { data, isLoading, isFetching, isError } = useGetProjectsQuery({})
    return (
        <Table config={config} data={data?.data ?? []} tableKey={"projects"}/>
    )
}
