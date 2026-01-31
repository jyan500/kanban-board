import React, { useEffect, useState } from "react"
import { useFormContext, useForm, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { NotificationType, OptionType, UserProfile } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useLazyGetUserQuery } from "../../services/private/userProfile"
import { notificationApi } from "../../services/private/notification"
import { displayUser } from "../../helpers/functions"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { setFilters } from "../../slices/notificationFilterSlice"
import { toggleShowSecondaryModal, setSecondaryModalProps, setSecondaryModalType } from "../../slices/secondaryModalSlice"
import { LoadingButton } from "../../components/page-elements/LoadingButton"
import { Button } from "../../components/page-elements/Button"
import { Switch } from "../page-elements/Switch"
import { Select } from "../page-elements/Select"
import { PLACEHOLDER_COLOR } from "../../helpers/constants"

interface FormValues {
	notificationType: OptionType
	user: OptionType
	dateFrom: string
	dateTo: string
	isUnread: boolean | null
}

export const Filters = () => {
	const { notificationTypes, notificationTypesForSelect } = useAppSelector((state) => state.notificationType)
	const { showSecondaryModal } = useAppSelector((state) => state.secondaryModal)
	const { filters } = useAppSelector((state) => state.notificationFilter)
	const dispatch = useAppDispatch()
	const defaultForm: FormValues = {
		notificationType: {label: "", value: ""},
		user: {label: "", value: ""},
		dateFrom: "",
		dateTo: "",
		isUnread: false,
	}
	const [ preloadedValues, setPreloadedValues ] = useState<FormValues>()
	const methods = useForm<FormValues>({defaultValues: preloadedValues})
	const { handleSubmit, setValue, register, reset, getValues, control, watch } = methods
	const [trigger, { data: user, isLoading}] = useLazyGetUserQuery()

	useEffect(() => {
		if (!showSecondaryModal){
			reset(defaultForm)
		}
	}, [showSecondaryModal])

	useEffect(() => {
		if (filters){
			const { notificationType, userId, dateFrom, dateTo, isUnread } = filters
			reset({
				...defaultForm,
				notificationType: notificationType ? {label: notificationTypes.find((type) => type.id.toString() === notificationType)?.name ?? "", value: notificationType.toString()} : {label: "", value: ""},
				dateFrom: dateFrom ?? "", 
				dateTo: dateTo ?? "",
				isUnread: isUnread != null ? (isUnread === "true" ? true : false) : null,
			})
			if (userId && !isNaN(userId)){
				trigger(Number(userId))
			}
		}
	}, [])

	useEffect(() => {
		if (!isLoading && user){
			setValue("user", {value: user.id.toString(), label: user.firstName + " " + user.lastName})
		}
	}, [isLoading, user])

	const onSubmit = (values: FormValues) => {
		const newFilterValues = {
			...filters,
			notificationType: values.notificationType.value !== "" ? values.notificationType.value : null,
			dateTo: values.dateTo !== "" ? values.dateTo : null,
			dateFrom: values.dateFrom !== "" ? values.dateFrom : null,
			isUnread: values.isUnread ? "true": null,
			userId: values.user.value !== "" ? Number(values.user.value) : null
		}
		dispatch(setFilters(newFilterValues))
		dispatch(toggleShowSecondaryModal(false))
		dispatch(setSecondaryModalProps({}))
		dispatch(setSecondaryModalType(undefined))
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className = "tw-flex tw-flex-col tw-gap-y-2">
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-type">Notification Type</label>
				<Controller name={"notificationType"} control={control} render={({field: {onChange}}) => ( 
					<Select 
						id={"filters-noti-type"}
						options={notificationTypesForSelect}
						defaultValue={watch("notificationType") ?? {value: "", label: ""}}
						onSelect={(selectedOption: {label: string, value: string} | null) => {
							onChange(selectedOption) 	
						}}
					/>
					)}>
				</Controller>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-date-from">Date From</label>
				<input {...register("dateFrom")} id = "filters-noti-date-from" aria-label="Date" type="date"/>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-date-to">Date To</label>
				<input {...register("dateTo")} id = "filters-noti-date-to" aria-label="Date" type="date"/>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-user">User</label>
				{
					!isLoading ? 	
					<Controller
						name={"user"}
						control={control}
		                render={({ field: { onChange, value, name, ref } }) => (
		                	<AsyncSelect 
								id={"filters-noti-user"}
			                	endpoint={USER_PROFILE_URL} 
			                	defaultValue={watch("user") ?? {value: "", label: ""}}
			                	urlParams={{forSelect: true}} 
			                	className={"tw-w-64"}
			                	onSelect={(selectedOption: {label: string, value: string} | null) => {
			                		onChange(selectedOption) 	
			                	}}
			                />
		                )}
					/> : 
					<LoadingSkeleton className= {PLACEHOLDER_COLOR} width = "tw-w-64" height="tw-h-10"/>	
				}
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-is-unread">Unread</label>
				<div>
					<Controller
						name="isUnread"
						control={control}
						render={({field: {onChange, value}}) => (
							<Switch
								onChange={(e) => {
									onChange(e.target.checked)
								}}
								checked={value ?? false}
							/>
						)}	
					/>
				</div>
			</div>
			<div className = "tw-flex tw-flex-row tw-gap-x-2">
				<LoadingButton type={"submit"} text={"Submit"}/>	
				<Button theme="secondary" onClick={(e) => {
					e.preventDefault()
					reset(defaultForm)
					const resetFilters = {
						...filters,
						notificationType: null,
						dateFrom: null,
						dateTo: null,
						isUnread: null,
						userId: null
					}
					dispatch(setFilters(resetFilters))
					dispatch(notificationApi.util.invalidateTags(["Notifications"]))
				}}>Clear Filters</Button>	
			</div>
		</form>
	)
}
