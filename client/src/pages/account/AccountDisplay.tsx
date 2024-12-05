import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { EditUserForm } from "../../components/EditUserForm"
import { displayUser } from "../../helpers/functions"
import { CgProfile } from "react-icons/cg"

export const AccountDisplay = () => {
	const dispatch = useAppDispatch()
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const [ changePassword, setChangePassword ] = useState(false)
	return (
		<div>
			<div className = "tw-flex tw-flex-row tw-gap-x-6">
				{userProfile ? 
					<>
						<div className = "tw-p-4 tw-border tw-border-gray-300 tw-shadow tw-rounded-md tw-flex tw-flex-col tw-items-center">
							<CgProfile className = "tw-w-32 tw-h-32"/>
							<div className = "tw-flex tw-flex-col">
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<div>{displayUser(userProfile)}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<div className = "tw-w-full">{userProfile?.email}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2">
									<div className = "tw-w-full">{userProfile?.organizationName}</div>	
								</div>
							</div>
						</div>
						<div className = "tw-w-full">
							<h1>Account</h1>
							<EditUserForm isAccountsPage={true} isChangePassword={false} userId={userProfile.id}/>
						</div>
					</>
				: null
				}
			</div>
		</div>
	)
}
