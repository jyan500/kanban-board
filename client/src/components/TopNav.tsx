import React from "react"
import { HamburgerButton } from "./HamburgerButton"
import "../styles/topnav.css"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks"
import { logout } from "../slices/authSlice" 
import { CgProfile } from "react-icons/cg"
import { LoadingSpinner } from "./LoadingSpinner"
import { privateApi } from "../services/private" 

interface Props {
	isFetching: boolean
}

export const TopNav = ({isFetching}: Props) => {
	const dispatch = useAppDispatch()
	const { organizations } = useAppSelector((state) => state.org)
	const { userProfile } = useAppSelector((state) => state.userProfile)
	const { token } = useAppSelector((state) => state.auth)
	const onLogout = () => {
		dispatch(logout())
		dispatch(privateApi.util.resetApiState())

	}
	return (
		<div className = "topnav">
			<div>
				<HamburgerButton/>	
			</div>
			<div className = "topnav-profile">
				{!isFetching ? (
					<>
						<div>
							<CgProfile className = "--l-icon"/>
						</div>
						<div>
							<span>{`${userProfile?.firstName} ${userProfile?.lastName}`}</span>
						</div>
					</>
				) : (
					<LoadingSpinner/>
				)}
				<div>
					<button onClick={onLogout}>Logout</button>
				</div>
			</div>
		</div>
	)
}