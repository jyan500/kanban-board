import React, { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { Link, Outlet, useParams } from "react-router-dom" 
import { Table } from "../../components/Table" 
import { EditUserForm } from "../../components/EditUserForm"
import { displayUser } from "../../helpers/functions"
import { CgProfile } from "react-icons/cg"
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaBuilding } from "react-icons/fa6";

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
							<div className = "tw-flex tw-flex-col tw-gap-y-2">
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><FaUser className = "--icon tw-mt-1"/></div>
									<div>{displayUser(userProfile)}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><MdEmail className = "--icon tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.email}</div>	
								</div>
								<div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-start">
									<div><FaBuilding className = "--icon tw-mt-1"/></div>
									<div className = "tw-w-full">{userProfile?.organizationName}</div>	
								</div>
								<button className = "button" onClick={() => setChangePassword(!changePassword)}>{changePassword ? "Hide Change" : "Change "} Password</button>
							</div>
						</div>
						<div className = "tw-w-full">
							<h1>Account</h1>
							<EditUserForm isAccountsPage={true} isChangePassword={changePassword} userId={userProfile.id}/>
						</div>
					</>
				: null
				}
			</div>
		</div>
	)
}
