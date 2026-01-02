import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useGetSprintQuery } from "../../services/private/sprint"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { BacklogSprintContainer } from "../../components/boards/BacklogSprintContainer"
import { Banner } from "../../components/page-elements/Banner"

export const Sprint = () => {
	const { boardInfo } = useAppSelector((state) => state.board)	
	const params = useParams<{sprintId: string}>()
    const [sprintId, setSprintId] = useState<number | undefined>(params.sprintId ? parseInt(params.sprintId) : undefined)
	const { data: sprintData, isFetching: isSprintFetching, isLoading: isSprintLoading, isError: isSprintError} = useGetSprintQuery(sprintId && boardInfo ? {id: sprintId, urlParams: {boardId: boardInfo.id}} : skipToken)

    if (!sprintData){
        return <Banner message={"The sprint you were looking for does not exist!"} type={"failure"}/>
    }

	return (
		<BacklogSprintContainer
			sprint={sprintData}
            setSprintId={setSprintId}
			isSprintLoading={isSprintLoading}
		/>
	)
}
