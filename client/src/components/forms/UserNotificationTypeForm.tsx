import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid" 
import { addToast } from "../../slices/toastSlice" 
import { LoadingSpinner } from "../LoadingSpinner"
import { UserNotificationType, NotificationType } from "../../types/common"
import { useGetUserNotificationTypesQuery, useUpdateUserNotificationTypesMutation } from "../../services/private/userProfile"
import { Switch } from "../page-elements/Switch"

export const UserNotificationTypeForm = () => {
	const dispatch = useAppDispatch()
	const { notificationTypes } = useAppSelector((state) => state.notificationType)
	const {data, isLoading: isUserNotificationTypesLoading} = useGetUserNotificationTypesQuery()
	const [updateUserNotificationTypes, {isLoading: isUpdateUserNotificationTypesLoading, error: userNotificationTypesError}] = useUpdateUserNotificationTypesMutation()
	const [notificationTypeIds, setNotificationTypeIds] = useState<Array<number>>([])

	useEffect(() => {
		if (!isUserNotificationTypesLoading && data){
			setNotificationTypeIds(data.map((userNotificationType) => userNotificationType.notificationTypeId))
		}
	}, [data, isUserNotificationTypesLoading])

    const onSubmit = async () => {
    	try {
			await updateUserNotificationTypes({ids: notificationTypeIds}).unwrap()
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "success",
    			animationType: "animation-in",
    			message: `User Notification Settings updated successfully!`,
    		}))
    	}
    	catch {
    		dispatch(addToast({
    			id: uuidv4(),
    			type: "failure",
    			animationType: "animation-in",
    			message: `Failed to update user notification settings.`,
    		}))
    	}
    }

    const onCheck = (id: number) => {
		const userNotificationTypeId = notificationTypeIds.find((notificationTypeId) => notificationTypeId === id)
		if (!userNotificationTypeId){
			const notificationType = notificationTypes.find((notificationType) => notificationType.id === id)
			if (notificationType){
				setNotificationTypeIds([...notificationTypeIds, notificationType.id])
			}
		}
		else {
			setNotificationTypeIds(notificationTypeIds.filter((notificationTypeId)=> notificationTypeId !== id))	
		}
	}

	return (
		<div>
			<h1>Notification Settings</h1>
			<form className = "tw-space-y-2" onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}>
				<div>
				{ !isUserNotificationTypesLoading ? (notificationTypes.map((notificationType) => (
					<div key = {`user_notification_type_${notificationType.id}`} className="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-py-2">
						<Switch id = {`user-notification-type-${notificationType.id}`} checked={notificationTypeIds.find((id) => id === notificationType.id) != null} onChange={(e) => onCheck(notificationType.id)}/>
						<label htmlFor = {`user-notification-type-${notificationType.id}`}>{notificationType.name}</label>
					</div>
				))) : <LoadingSpinner/>}
				</div>
				<button type="submit" className = "button">Submit</button>
			</form>
		</div>
	)	
}
