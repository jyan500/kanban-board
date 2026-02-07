import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal } from "../../slices/modalSlice"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { OptionType, Sprint } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Controller, useForm, FormProvider } from "react-hook-form"
import { 
    useGetSprintQuery, 
    useCompleteSprintMutation,
} from "../../services/private/sprint"
import { Switch } from "../page-elements/Switch"
import { SimpleEditor } from "../page-elements/SimpleEditor"
import { MOVE_OPEN_ITEM_OPTIONS, STANDARD_BORDER } from "../../helpers/constants"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { TicketFormPlaceholder } from "../placeholders/TicketFormPlaceholder"
import { Select } from "../page-elements/Select"
import { PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"
import { Label } from "../page-elements/Label"

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
            <p className = {`${PRIMARY_TEXT} tw-text-lg tw-font-bold`}>Complete {sprintInfo?.name}</p>
            <p className = {`${SECONDARY_TEXT} tw-font-medium tw-text-gray-500`}>{sprintInfo?.startDate ? new Date(sprintInfo.startDate).toLocaleDateString() : ""} - {sprintInfo?.endDate ? new Date(sprintInfo.endDate).toLocaleDateString() : ""}</p>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="tw-w-full tw-flex tw-flex-col tw-gap-y-2">
                    <div className = {`${STANDARD_BORDER} tw-p-2`}>
                        <p className = {`${SECONDARY_TEXT} tw-font-semibold`}>
                            This sprint contains <span className = "tw-font-bold tw-text-green-500">{sprintInfo?.numCompletedTickets}</span> completed work items and <span className={`tw-font-bold ${PRIMARY_TEXT}`}>{sprintInfo?.numOpenTickets}</span> open work items. 
                        </p>
                        <ul className={`${SECONDARY_TEXT} tw-text-sm`}>
                            <li>
                                Completed work items includes everything in the last column on the board (i.e Completed).
                            </li>
                            <li>
                                Open work items includes everything from any other column on the board. Move these to a new sprint or the backlog.
                            </li>
                        </ul>
                    </div>
                    <div className = "tw-flex tw-flex-col tw-gap-y-2">
                        <Label htmlFor="move-open-work-items">Move open work items to</Label>
                        <Controller
                            name={"moveItemsOption"}
                            control={control}
                            render={({field: {onChange}}) => (
                                <Select
                                    id={"move-open-work-items"}
                                    options={
                                        MOVE_OPEN_ITEM_OPTIONS
                                    }
                                    defaultValue={watch("moveItemsOption") ? {value: watch("moveItemsOption"), label: MOVE_OPEN_ITEM_OPTIONS.find((obj) => obj.value === watch("moveItemsOption"))?.label ?? ""} : {label: "", value: ""}}
                                    clearable={false}
                                    searchable={false}
                                    onSelect={(selectedOption: OptionType | null) => {
                                        if (selectedOption){
                                            onChange(selectedOption.value)
                                        }
                                    }}
                                />
                            )}
                        >


                        </Controller>
                        {errors?.moveItemsOption && <small className = "--text-alert">{errors.moveItemsOption.message}</small>}
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-y-2">
                        <Label htmlFor="sprint-debrief">
                            Debrief
                        </Label>
                        <SimpleEditor
                            id={"sprint-debrief"}
                            registerField={"debrief"}
                            registerOptions={registerOptions.debrief}
                        />
                    </div>
                    <div>
                        <LoadingButton isLoading={submitLoading} type="submit" text="Submit" className="button" />
                    </div>
                </form>
            </FormProvider>     
        </div>
    )
}
