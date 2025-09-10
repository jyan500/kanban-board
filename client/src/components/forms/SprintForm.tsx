import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { toggleShowModal } from "../../slices/modalSlice"
import { v4 as uuidv4 } from "uuid"
import { addToast } from "../../slices/toastSlice"
import { LoadingButton } from "../page-elements/LoadingButton"
import { Sprint } from "../../types/common"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Controller, useForm, FormProvider } from "react-hook-form"
import { useAddSprintMutation, useGetSprintQuery, useUpdateSprintMutation } from "../../services/private/sprint"
import { Switch } from "../page-elements/Switch"
import { SimpleEditor } from "../page-elements/SimpleEditor"

interface SprintFormProps {
    sprintId?: number;
    boardId?: number;
}

interface SprintFormValues {
    id?: number;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    debrief?: string;
    isCompleted?: boolean;
}

export const SprintForm = ({ sprintId, boardId }: SprintFormProps) => {
    const dispatch = useAppDispatch()
    const { showModal } = useAppSelector((state) => state.modal)
    const defaultForm: SprintFormValues = {
        id: undefined,
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        debrief: "",
        isCompleted: false,
    }

    const [addSprint] = useAddSprintMutation()
    const [updateSprint] = useUpdateSprintMutation()
    const { data: sprintInfo, isLoading: isGetSprintDataLoading } = useGetSprintQuery(sprintId ? { id: sprintId, urlParams: {} } : skipToken)

    const [preloadedValues, setPreloadedValues] = useState<SprintFormValues>(defaultForm)
    const methods  = useForm<SprintFormValues>({
        defaultValues: preloadedValues
    })
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = methods
    const [submitLoading, setSubmitLoading] = useState(false)

    const registerOptions = {
        name: { required: "Name is required" },
        goal: { required: "Goal is required" },
        startDate: { required: "Start Date is required" },
        endDate: { required: "End Date is required" },
        debrief: {}
    }

    useEffect(() => {
        if (sprintInfo) {
            reset({
                id: sprintId,
                name: sprintInfo.name,
                goal: sprintInfo.goal,
                startDate: sprintInfo.startDate ? new Date(sprintInfo.startDate).toISOString().split('T')[0] : "",
                endDate: sprintInfo.endDate ? new Date(sprintInfo.endDate).toISOString().split('T')[0] : "",
                debrief: sprintInfo.debrief || "",
                isCompleted: sprintInfo.isCompleted || false,
            })
        } else {
            reset(defaultForm)
        }
    }, [showModal, sprintInfo, sprintId])

    const onSubmit = async (values: SprintFormValues) => {
        setSubmitLoading(true)
        try {
            if (values.id != null && sprintId) {
                await updateSprint({
                    id: sprintId,
                    name: values.name,
                    goal: values.goal,
                    startDate: new Date(values.startDate),
                    endDate: new Date(values.endDate),
                    debrief: values.debrief,
                    isCompleted: values.isCompleted ?? false,
                }).unwrap()
            } else {
                await addSprint({
                    name: values.name,
                    goal: values.goal,
                    startDate: new Date(values.startDate),
                    endDate: new Date(values.endDate),
                    boardId: boardId ?? 0,
                }).unwrap()
            }
            dispatch(toggleShowModal(false))
            dispatch(addToast({
                id: uuidv4(),
                type: "success",
                animationType: "animation-in",
                message: `Sprint ${values.id != null ? "updated" : "added"} successfully!`,
            }))
        }
        catch (error) {
            console.error(error)
            dispatch(addToast({
                id: uuidv4(),
                type: "failure",
                animationType: "animation-in",
                message: `Failed to ${values.id != null ? "update" : "add"} sprint.`,
            }))
        }
        finally {
            setSubmitLoading(false)
        }
    }

    const isCompleted = watch("isCompleted")

    return (
        <div className="tw-flex tw-flex-col tw-gap-y-2 lg:tw-w-[80%] tw-w-full">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="tw-w-full tw-flex tw-flex-col tw-gap-y-2">
                    <div className="tw-flex tw-flex-col">
                        <label className="label" htmlFor="sprint-name">
                            Name <span className="tw-font-bold tw-text-red-500">*</span>
                        </label>
                        <input id="sprint-name" type="text"
                            {...register("name", registerOptions.name)}
                            className="tw-w-full"
                        />
                        {errors?.name && <small className="--text-alert">{errors.name.message}</small>}
                    </div>
                    <div className="tw-flex tw-flex-col">
                        <label className="label" htmlFor="sprint-goal">
                            Goal <span className="tw-font-bold tw-text-red-500">*</span>
                        </label>
                        <SimpleEditor
                            registerField={"goal"}
                            registerOptions={registerOptions.goal}
                        />
                        {errors?.goal && <small className="--text-alert">{errors.goal.message}</small>}
                    </div>
                    <div className="tw-flex tw-flex-col">
                        <label className="label" htmlFor="sprint-start-date">
                            Start Date <span className="tw-font-bold tw-text-red-500">*</span>
                        </label>
                        <input id="sprint-start-date" type="date"
                            {...register("startDate", registerOptions.startDate)}
                            className="tw-w-full"
                        />
                        {errors?.startDate && <small className="--text-alert">{errors.startDate.message}</small>}
                    </div>
                    <div className="tw-flex tw-flex-col">
                        <label className="label" htmlFor="sprint-end-date">
                            End Date <span className="tw-font-bold tw-text-red-500">*</span>
                        </label>
                        <input id="sprint-end-date" type="date"
                            {...register("endDate", registerOptions.endDate)}
                            className="tw-w-full"
                        />
                        {errors?.endDate && <small className="--text-alert">{errors.endDate.message}</small>}
                    </div>
                    {sprintId && (
                        <div className="tw-flex tw-flex-col">
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-py-2">
                                <Controller 
                                    name={"isCompleted"}
                                    control={control}
                                    render={({ field: { onChange, value, name, ref } }) => {
                                    return (
                                        <Switch onChange={onChange} checked={value == true} id = {"sprint-is-completed"}/>
                                    )
                                }}/>
                                <label className="label" htmlFor="sprint-is-completed">
                                    Completed
                                </label>
                            </div>
                        </div>
                    )}
                    {sprintId && isCompleted && (
                        <div className="tw-flex tw-flex-col">
                            <label className="label" htmlFor="sprint-debrief">
                                Debrief
                            </label>
                            <SimpleEditor
                                registerField={"debrief"}
                                registerOptions={registerOptions.debrief}
                            />
                        </div>
                    )}
                    <div className="tw-flex tw-flex-col">
                        <LoadingButton isLoading={submitLoading} type="submit" text="Submit" className="button" />
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
