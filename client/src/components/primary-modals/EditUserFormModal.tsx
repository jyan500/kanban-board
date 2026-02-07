import React, { useState, useEffect } from "react"
import { EditUserForm } from "../EditUserForm"

type Props = {
	userId: number
}

export const EditUserFormModal = ({userId}: Props) => {
	return (
		<div className="tw-w-full lg:tw-w-1/2">
			<EditUserForm isAccountsPage={false} isChangePassword={false} userId={userId}/>
		</div>
	)
}
