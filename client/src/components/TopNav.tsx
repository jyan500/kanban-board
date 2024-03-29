import React from "react"
import { HamburgerButton } from "./HamburgerButton"
import "../styles/topnav.css"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { logout } from "../slices/authSlice" 
import { CgProfile } from "react-icons/cg"

export const TopNav = () => {
	const dispatch = useAppDispatch()
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const onLogout = () => {
		dispatch(logout())
	}
	return (
		<div className = "topnav">
			<div>
				<HamburgerButton/>	
			</div>
			<div className = "topnav-profile">
				<div>
					<CgProfile className = "--l-icon"/>
				</div>
				<div>
					<span>{`${userProfile?.firstName} ${userProfile?.lastName}`}</span>
					<small>{organizations.find((org) => org.id === userProfile?.organizationId)?.name}</small>
				</div>
				<div>
					<button onClick={onLogout}>Logout</button>
				</div>
			</div>
		</div>
	)
}