import React from "react"
import { useFormContext, FormProvider, SubmitHandler, Controller } from "react-hook-form"
import { useAppSelector, useAppDispatch } from "../../hooks/redux-hooks"
import { NotificationType, UserProfile } from "../../types/common"
import { LoadingSpinner } from "../LoadingSpinner"
import { USER_PROFILE_URL } from "../../helpers/urls"
import { AsyncSelect, LoadOptionsType } from "../../components/AsyncSelect"

export const Filters = () => {
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const methods = useFormContext()
	const { register, control } = methods
	return (
		<div className = "tw-flex tw-flex-row tw-gap-x-2">
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
				<input {...register("dateFrom")} aria-label="Date" type="date"/>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-date-to">Date To</label>
				<input {...register("dateTo")} aria-label="Date" type="date"/>
			</div>
			<div className = "tw-flex tw-flex-col">
				<label className = "label" htmlFor = "filters-noti-user">User</label>
				<Controller
					name={"user"}
					control={control}
	                render={({ field: { onChange, value, name, ref } }) => (
	                	<AsyncSelect 
		                	endpoint={USER_PROFILE_URL} 
		                	urlParams={{forSelect: true}} 
		                	className={"tw-w-64"}
		                	onSelect={(selectedOption: {label: string, value: string} | null) => {
		                		onChange(selectedOption?.value ?? "") 	
		                	}}
		                />
	                )}
				/>
			</div>
		</div>
	)
}
