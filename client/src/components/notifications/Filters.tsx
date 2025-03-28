import React from "react"
import { useFormContext, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { NotificationType, UserProfile } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetUserQuery } from "../../services/private/userProfile"
import { displayUser } from "../../helpers/functions"
import { LoadingSkeleton } from "../page-elements/LoadingSkeleton"
import { Switch } from "../page-elements/Switch"

export const Filters = () => {
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const methods = useFormContext()
	const { register, getValues, control } = methods
	const { data: user, isLoading} = useGetUserQuery(!isNaN(Number(getValues("user"))) ? Number(getValues("user")) : skipToken)
	return (
		<div className = "tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-gap-x-2">
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-type">Notification Type</label>
				<select className = "tw-w-full" id = "filters-noti-type" {...register("notificationType")}>
					<option value="" disabled></option>
					{notificationTypes.map((notificationType: NotificationType) => {
						return <option key = {notificationType.id} value = {notificationType.id}>{notificationType.name}</option>
					})}
				</select>
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
			                	endpoint={USER_PROFILE_URL} 
			                	defaultValue={{value: user ? user.id.toString() : "", label: displayUser(user)}}
			                	urlParams={{forSelect: true}} 
			                	className={"tw-w-64"}
			                	onSelect={(selectedOption: {label: string, value: string} | null) => {
			                		onChange(selectedOption?.value ?? "") 	
			                	}}
			                />
		                )}
					/> : 
					<LoadingSkeleton className= "tw-bg-gray-200" width = "tw-w-64" height="tw-h-10"/>	
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
								checked={value}
							/>
						)}	
					/>
				</div>
			</div>
		</div>
	)
}
