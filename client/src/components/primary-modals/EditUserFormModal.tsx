import React, { useState, useEffect } from "react"
import { EditUserForm } from "../EditUserForm"

type Props = {
	userId: number
}

export const EditUserFormModal = ({userId}: Props) => {
	return (
		<EditUserForm isAccountsPage={false} isChangePassword={false} userId={userId}/>
	)
}
