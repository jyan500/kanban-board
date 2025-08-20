import React, {useState} from "react"
import { Notification } from "../../types/common"
import { IconContext } from "react-icons"
import { CgProfile } from "react-icons/cg"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TfiUnlink as Unlink } from "react-icons/tfi";
import { IconButton } from "../page-elements/IconButton"
import { useGetUserQuery } from "../../services/private/userProfile"
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Avatar } from "../page-elements/Avatar"
import { getUserInitials } from "../../helpers/functions"
import { Indicator } from "../page-elements/Indicator"

type Props = {
	notification: Notification | undefined
}

export const NotificationRow = ({notification}: Props) => {
	const [showConfirmUnlink, setShowConfirmUnlink] = useState(false)
	const { data, isFetching } = useGetUserQuery(notification?.senderId ?? skipToken)
	return (
		<div className = {`${!notification?.isRead ? "tw-bg-gray-50" : ""} tw-relative hover:tw-bg-gray-50 tw-p-2 tw-flex tw-flex-row tw-gap-x-2 tw-w-full tw-items-center tw-border tw-border-gray-200 tw-rounded-md tw-group`}>
			<Indicator className = {"tw-top-0 tw-left-0 tw-ml-1 tw-mt-1 tw-bg-red-500 tw-w-2 tw-h-2"} showIndicator={!notification?.isRead}/>
			{isFetching ? <CgProfile className = "tw-mt-1 tw-shrink-0 tw-w-6 tw-h-6"/> : <Avatar userInitials={getUserInitials(data)} imageUrl={data?.imageUrl} className = "!tw-w-6 !tw-h-6 tw-mt-1 tw-shrink-0 tw-rounded-full"/>}
			<div>
				<p>{notification?.body}</p>
			</div>
		</div>
	)
}
