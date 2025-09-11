import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal } from "../../slices/modalSlice"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Sprint } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Controller, useForm, FormProvider } from "react-hook-form"
import { 
    useGetSprintQuery, 
    useCompleteSprintMutation,
} from "../../services/private/sprint"
import { Switch } from "../page-elements/Switch"
import { SimpleEditor } from "../page-elements/SimpleEditor"
import { MOVE_OPEN_ITEM_OPTIONS } from "../../helpers/constants"

interface CompleteSprintFormProps {
    sprintId?: number;
    boardId?: number;
}

interface CompleteSprintFormValues {
    id: number;
    debrief?: string;
    moveItemsOption: string
}

export const CompleteSprintForm = ({ sprintId, boardId }: CompleteSprintFormProps) => {
    const dispatch = useAppDispatch()
    const { showModal } = useAppSelector((state) => state.modal)
    const defaultForm: CompleteSprintFormValues = {
        id: sprintId ?? 0,
        debrief: "",
        moveItemsOption: ""
    }

    const [completeSprint] = useCompleteSprintMutation()
    const { data: sprintInfo, isLoading: isGetSprintDataLoading } = useGetSprintQuery(sprintId ? { id: sprintId, urlParams: {includeTicketStats: true} } : skipToken)

    const [preloadedValues, setPreloadedValues] = useState<CompleteSprintFormValues>(defaultForm)
    const methods  = useForm<CompleteSprintFormValues>({
        defaultValues: preloadedValues
    })
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = methods
    const [submitLoading, setSubmitLoading] = useState(false)

    const registerOptions = {
        moveItemsOption: {"required": "Option is required"},
        debrief: {}
    }

    const onSubmit = async (values: CompleteSprintFormValues) => {
        setSubmitLoading(true)
        try {
            await completeSprint({...values, isCompleted: true}).unwrap()
            dispatch(toggleShowModal(false))
            dispatch(addToast({
                id: uuidv4(),
                type: "success",
                animationType: "animation-in",
                message: `Sprint completed successfully!`,
            }))
        }
        catch (error) {
            console.error(error)
            dispatch(addToast({
                id: uuidv4(),
                type: "failure",
                animationType: "animation-in",
                message: `Failed to complete sprint.`,
            }))
        }
        finally {
            setSubmitLoading(false)
        }
    }

    return (
        <div className="tw-flex tw-flex-col tw-gap-y-2 lg:tw-w-[80%] tw-w-full">
            <p className = "tw-text-lg tw-font-bold">Complete {sprintInfo?.name}</p>
            <p className = " tw-font-medium tw-text-gray-500">{sprintInfo?.startDate ? new Date(sprintInfo.startDate).toLocaleDateString() : ""} - {sprintInfo?.endDate ? new Date(sprintInfo.endDate).toLocaleDateString() : ""}</p>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="tw-w-full tw-flex tw-flex-col tw-gap-y-2">
                    <div className = "tw-border tw-p-2">
                        <p className = "tw-font-semibold tw-text-gray-500">
                            This sprint contains 0 completed work items and 2 open work items. 
                        </p>
                        <ul>
                            <li>
                                Completed work items includes everything in the last column on the board, Done.
                            </li>
                            <li>
                                Open work items includes everything from any other column on the board. Move these to a new sprint or the backlog.
                            </li>
                        </ul>
                    </div>
                    <div className = "tw-flex tw-flex-col">
                        <label className = "label" htmlFor="move-open-work-items">Move open work items to</label>
                        <select id={"move-open-work-items"} {...register("moveItemsOption", registerOptions.moveItemsOption)}>
                            {
                                MOVE_OPEN_ITEM_OPTIONS.map((obj) => {
                                    return <option value={obj.value} key={obj.label}>{obj.label}</option>
                                })
                            }
                        </select>
                        {errors?.moveItemsOption && <small className = "--text-alert">{errors.moveItemsOption.message}</small>}
                    </div>
                    <div className="tw-flex tw-flex-col">
                        <label className="label" htmlFor="sprint-debrief">
                            Debrief
                        </label>
                        <SimpleEditor
                            registerField={"debrief"}
                            registerOptions={registerOptions.debrief}
                        />
                    </div>
                    <div className="tw-flex tw-flex-col">
                        <LoadingButton isLoading={submitLoading} type="submit" text="Submit" className="button" />
                    </div>
                </form>
            </FormProvider>
           

        </div>
    )
}
