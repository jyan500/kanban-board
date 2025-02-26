import React from "react"
import { Avatar } from "./Avatar"
import { ProfileActivity, TicketComment, TicketActivity } from "../../types/common"
import { displayUser } from "../../helpers/functions"

interface Props<T> {
	data: T
	additional?: string
	children: React.ReactNode
}

export const ProfileActivityRow = <T extends ProfileActivity>({data, additional, children}: Props<T>) => {
	return (
		<div key = { data.id } className = "tw-flex tw-flex-row tw-items-start tw-gap-x-2">
			<Avatar className = "tw-rounded-full" imageUrl={data.user?.imageUrl}/>
			<div className = "tw-flex tw-flex-col tw-gap-y-2 tw-w-full">
				<div className = "tw-flex tw-flex-row tw-gap-x-2">
					<span className = "tw-font-bold">{displayUser(data.user)}</span>
					{additional ? <span>{additional}</span> : null}
					<span>{data.createdAt ? new Date(data.createdAt).toLocaleString() : ""}</span>
				</div>
				{children}
			</div>
		</div>
	)
}